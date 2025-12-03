// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock chokidar with proper event simulation
const fs = require('fs');
const path = require('path');

// Store original fs methods
const originalWriteFileSync = fs.writeFileSync;
const originalUnlinkSync = fs.unlinkSync;
const originalExistsSync = fs.existsSync;

// Track active watchers and existing files
const activeWatchers = new Set();
const trackedFiles = new Set();

jest.mock('chokidar', () => {
  const EventEmitter = require('events');
  
  return {
    default: {
      watch: (pattern, options) => {
        const watcher = new EventEmitter();
        watcher.close = jest.fn(() => {
          activeWatchers.delete(watcher);
          return Promise.resolve();
        });
        
        // Store pattern and options for later use
        watcher._pattern = pattern;
        watcher._options = options;
        
        activeWatchers.add(watcher);
        return watcher;
      },
    },
    watch: (pattern, options) => {
      const EventEmitter = require('events');
      const watcher = new EventEmitter();
      watcher.close = jest.fn(() => {
        activeWatchers.delete(watcher);
        return Promise.resolve();
      });
      
      // Store pattern and options for later use
      watcher._pattern = pattern;
      watcher._options = options;
      
      activeWatchers.add(watcher);
      return watcher;
    },
  };
});

// Override fs.writeFileSync to trigger chokidar events
fs.writeFileSync = function(...args) {
  const filePath = args[0];
  const fileExisted = trackedFiles.has(filePath);
  
  const result = originalWriteFileSync.apply(fs, args);
  
  // Track this file
  trackedFiles.add(filePath);
  
  // Trigger chokidar events for active watchers
  setTimeout(() => {
    activeWatchers.forEach(watcher => {
      if (watcher._pattern) {
        // Simple pattern matching for *.json files
        const patternDir = path.dirname(watcher._pattern);
        const fileDir = path.dirname(filePath);
        const fileName = path.basename(filePath);
        
        // Check if file is in the watched directory and matches pattern
        if (fileDir === patternDir && fileName.endsWith('.json')) {
          // Emit 'change' if file existed, 'add' if new
          if (fileExisted) {
            watcher.emit('change', filePath);
          } else {
            watcher.emit('add', filePath);
          }
        }
      }
    });
  }, 50);
  
  return result;
};

// Override fs.unlinkSync to trigger chokidar events
fs.unlinkSync = function(...args) {
  const filePath = args[0];
  const result = originalUnlinkSync.apply(fs, args);
  
  // Remove from tracked files
  trackedFiles.delete(filePath);
  
  // Trigger chokidar events for active watchers
  setTimeout(() => {
    activeWatchers.forEach(watcher => {
      if (watcher._pattern) {
        // Simple pattern matching for *.json files
        const patternDir = path.dirname(watcher._pattern);
        const fileDir = path.dirname(filePath);
        const fileName = path.basename(filePath);
        
        // Check if file is in the watched directory and matches pattern
        if (fileDir === patternDir && fileName.endsWith('.json')) {
          watcher.emit('unlink', filePath);
        }
      }
    });
  }, 50);
  
  return result;
};
