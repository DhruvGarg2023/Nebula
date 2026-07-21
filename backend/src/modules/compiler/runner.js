import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../core/logger/index.js';

const TIMEOUT_MS = 5000; // 5 second hard limit for code execution

/**
 * Runs code in a sandboxed temporary workspace with child process spawning.
 */
export async function runCode({ language, sourceCode, onStdout, onStderr }) {
  const normalizedLang = (language || '').toLowerCase().trim();
  const workDir = path.join(os.tmpdir(), `collab_exec_${uuidv4()}`);

  try {
    await fs.mkdir(workDir, { recursive: true });

    let command = '';
    let args = [];
    let sourceFileName = '';
    let compileCmd = null;
    let compileArgs = [];
    let binaryName = os.platform() === 'win32' ? 'app.exe' : './app';

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
        args = [path.join(workDir, sourceFileName)];
        break;

      case 'c':
        sourceFileName = 'main.c';
        compileCmd = 'gcc';
        compileArgs = [path.join(workDir, sourceFileName), '-o', path.join(workDir, 'app')];
        command = path.join(workDir, 'app');
        args = [];
        break;

      case 'cpp':
      case 'c++':
        sourceFileName = 'main.cpp';
        compileCmd = 'g++';
        compileArgs = [path.join(workDir, sourceFileName), '-o', path.join(workDir, 'app')];
        command = path.join(workDir, 'app');
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
      const compileResult = await runProcess(compileCmd, compileArgs, workDir, TIMEOUT_MS, onStdout, onStderr);
      if (compileResult.exitCode !== 0) {
        return {
          stdout: compileResult.stdout,
          stderr: `Compilation Error:\n${compileResult.stderr}`,
          exitCode: compileResult.exitCode,
          executionTimeMs: Date.now() - startTime,
          status: 'failed',
        };
      }
    }

    // Execute binary / script
    const result = await runProcess(command, args, workDir, TIMEOUT_MS, onStdout, onStderr);
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

function runProcess(command, args, cwd, timeoutMs, onStdout, onStderr) {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const child = spawn(command, args, {
      cwd,
      env: { PATH: process.env.PATH },
      windowsHide: true,
    });

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
      if (err.code === 'ENOENT') {
        stderr += `Command not found: ${command}. Please ensure runtime/compiler is installed.\n`;
      } else {
        stderr += `Process error: ${err.message}\n`;
      }
      resolve({ stdout, stderr, exitCode: 1, timedOut });
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr: timedOut ? `${stderr}\nExecution timed out after ${timeoutMs / 1000}s` : stderr,
        exitCode: timedOut ? 124 : (code ?? 0),
        timedOut,
      });
    });
  });
}
