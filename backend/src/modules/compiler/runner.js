import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../core/logger/index.js';
import { createRedisClient } from '../../core/redis/client.js';
import config from '../../config/index.js';

let subscriber = null;
const activeJobs = new Map();

function getSubscriber() {
  if (!subscriber) {
    subscriber = createRedisClient(config.REDIS_URL || process.env.REDIS_URL, 'runner_subscriber');
    subscriber.psubscribe('job:stdin:*', (err) => {
      if (err) logger.error({ err }, 'Failed to subscribe to STDIN channels');
    });
    subscriber.on('pmessage', (pattern, channel, message) => {
      const jobId = channel.split(':').pop();
      const childStdin = activeJobs.get(jobId);
      if (childStdin && !childStdin.destroyed) {
        childStdin.write(message + '\n');
      }
    });
  }
  return subscriber;
}

const TIMEOUT_MS = 5000; // 5 second hard limit for code execution

/**
 * Runs code in a sandboxed temporary workspace with child process spawning.
 */
export async function runCode({ jobId, language, sourceCode, stdin, onStdout, onStderr }) {
  const normalizedLang = (language || '').toLowerCase().trim();
  const workDir = path.join(os.tmpdir(), `collab_exec_${uuidv4()}`);

  try {
    await fs.mkdir(workDir, { recursive: true });

    let command = '';
    let args = [];
    let sourceFileName = '';
    let compileCmd = null;
    let compileArgs = [];

    switch (normalizedLang) {
      case 'javascript':
      case 'js':
      case 'node':
        sourceFileName = 'script.js';
        command = 'node';
        args = [path.join(workDir, sourceFileName)];
        break;

      case 'python':
      case 'py':
      case 'python3':
        sourceFileName = 'script.py';
        command = os.platform() === 'win32' ? 'python' : 'python3';
        args = ['-u', path.join(workDir, sourceFileName)];
        break;

      case 'c':
        sourceFileName = 'main.c';
        compileCmd = 'gcc';
        {
          const exeName = os.platform() === 'win32' ? 'app.exe' : 'app';
          compileArgs = [path.join(workDir, sourceFileName), '-o', path.join(workDir, exeName)];
          command = path.join(workDir, exeName);
        }
        args = [];
        break;

      case 'cpp':
      case 'c++':
        sourceFileName = 'main.cpp';
        compileCmd = 'g++';
        {
          const exeName = os.platform() === 'win32' ? 'app.exe' : 'app';
          compileArgs = [path.join(workDir, sourceFileName), '-o', path.join(workDir, exeName)];
          command = path.join(workDir, exeName);
        }
        args = [];
        break;

      case 'java':
        sourceFileName = 'Main.java';
        compileCmd = 'javac';
        compileArgs = [path.join(workDir, sourceFileName)];
        command = 'java';
        args = ['-cp', workDir, 'Main'];
        break;

      default:
        throw new Error(`Unsupported language: ${language}`);
    }

    const sourcePath = path.join(workDir, sourceFileName);
    await fs.writeFile(sourcePath, sourceCode, 'utf-8');

    const startTime = Date.now();

    // Handle compilation step for C, C++, Java if needed
    if (compileCmd) {
      const compileResult = await runProcess(null, compileCmd, compileArgs, workDir, TIMEOUT_MS, onStdout, onStderr);
      if (compileResult.exitCode !== 0) {
        return {
          stdout: compileResult.stdout,
          stderr: compileResult.stderr ? `Compilation Error:\n${compileResult.stderr}` : 'Compilation failed',
          exitCode: compileResult.exitCode,
          executionTimeMs: Date.now() - startTime,
          status: 'failed',
        };
      }
    }

    // Execute binary / script
    const result = await runProcess(jobId, command, args, workDir, TIMEOUT_MS, onStdout, onStderr, stdin);
    const executionTimeMs = Date.now() - startTime;

    return {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      executionTimeMs,
      status: result.timedOut ? 'timeout' : (result.exitCode === 0 ? 'completed' : 'failed'),
    };
  } finally {
    // Clean up temporary workspace directory
    try {
      await fs.rm(workDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      logger.error({ cleanupErr, workDir }, 'Failed to clean up execution directory');
    }
  }
}

function runProcess(jobId, command, args, cwd, timeoutMs, onStdout, onStderr, stdinStr) {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const child = spawn(command, args, {
      cwd,
      env: process.env,
      windowsHide: true,
      shell: os.platform() === 'win32',
    });

    if (stdinStr) {
      child.stdin.write(stdinStr);
      // We don't end the stream yet so interactive STDIN can still be pushed
    }

    if (jobId) {
      getSubscriber(); // Ensure subscriber is running
      activeJobs.set(jobId, child.stdin);
    }

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stdout.on('data', (data) => {
      const text = data.toString('utf-8');
      stdout += text;
      if (typeof onStdout === 'function') onStdout(text);
    });

    child.stderr.on('data', (data) => {
      const text = data.toString('utf-8');
      stderr += text;
      if (typeof onStderr === 'function') onStderr(text);
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      const errMsg =
        err.code === 'ENOENT'
          ? `Command not found: ${command}. Please ensure runtime/compiler is installed.\n`
          : `Process error: ${err.message}\n`;
      stderr += errMsg;
      if (typeof onStderr === 'function') onStderr(errMsg);
      resolve({ stdout, stderr, exitCode: 1, timedOut });
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      if (jobId) {
        activeJobs.delete(jobId);
      }
      resolve({
        stdout,
        stderr: timedOut ? `${stderr}\nExecution timed out after ${timeoutMs / 1000}s` : stderr,
        exitCode: timedOut ? 124 : (code ?? 0),
        timedOut,
      });
    });
  });
}
