/**
 * Performance Monitor Service
 * Tracks and logs performance metrics for ride notifications
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      rideCreation: [],
      driverNotification: [],
      geocoding: [],
      captainSearch: []
    };
    
    this.maxMetrics = 100; // Keep last 100 measurements
    this.performanceTargets = {
      rideCreation: 1000, // 1 second
      driverNotification: 2000, // 2 seconds
      geocoding: 500, // 0.5 seconds
      captainSearch: 300 // 0.3 seconds
    };
  }

  /**
   * Start timing an operation
   */
  startTimer(operationId) {
    const startTime = Date.now();
    return {
      operationId,
      startTime,
      end: (metadata = {}) => {
        const duration = Date.now() - startTime;
        this.recordMetric(operationId, duration, metadata);
        return duration;
      }
    };
  }

  /**
   * Record a performance metric
   */
  recordMetric(operation, duration, metadata = {}) {
    const metric = {
      timestamp: new Date(),
      duration,
      metadata,
      isSlowOperation: duration > this.performanceTargets[operation]
    };

    // Add to metrics array
    if (!this.metrics[operation]) {
      this.metrics[operation] = [];
    }
    
    this.metrics[operation].push(metric);
    
    // Keep only last N measurements
    if (this.metrics[operation].length > this.maxMetrics) {
      this.metrics[operation].shift();
    }

    // Log performance issues
    if (metric.isSlowOperation) {
      console.warn(`⚠️ SLOW ${operation.toUpperCase()}: ${duration}ms (target: ${this.performanceTargets[operation]}ms)`, metadata);
    } else {
      console.log(`⚡ FAST ${operation.toUpperCase()}: ${duration}ms`, metadata);
    }

    return metric;
  }

  /**
   * Get performance statistics for an operation
   */
  getStats(operation) {
    const metrics = this.metrics[operation] || [];
    
    if (metrics.length === 0) {
      return {
        operation,
        count: 0,
        average: 0,
        min: 0,
        max: 0,
        slowOperations: 0,
        target: this.performanceTargets[operation]
      };
    }

    const durations = metrics.map(m => m.duration);
    const slowCount = metrics.filter(m => m.isSlowOperation).length;

    return {
      operation,
      count: metrics.length,
      average: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
      min: Math.min(...durations),
      max: Math.max(...durations),
      slowOperations: slowCount,
      slowPercentage: Math.round((slowCount / metrics.length) * 100),
      target: this.performanceTargets[operation],
      recentMetrics: metrics.slice(-5) // Last 5 measurements
    };
  }

  /**
   * Get overall performance summary
   */
  getSummary() {
    const operations = Object.keys(this.metrics);
    const summary = {
      timestamp: new Date(),
      operations: {}
    };

    operations.forEach(operation => {
      summary.operations[operation] = this.getStats(operation);
    });

    return summary;
  }

  /**
   * Log performance summary
   */
  logSummary() {
    const summary = this.getSummary();
    
    console.log('\n📊 PERFORMANCE SUMMARY:');
    console.log('========================');
    
    Object.entries(summary.operations).forEach(([operation, stats]) => {
      if (stats.count > 0) {
        const status = stats.slowPercentage > 20 ? '❌' : stats.slowPercentage > 10 ? '⚠️' : '✅';
        console.log(`${status} ${operation.toUpperCase()}:`);
        console.log(`   Average: ${stats.average}ms (target: ${stats.target}ms)`);
        console.log(`   Range: ${stats.min}ms - ${stats.max}ms`);
        console.log(`   Slow operations: ${stats.slowOperations}/${stats.count} (${stats.slowPercentage}%)`);
      }
    });
    
    console.log('========================\n');
  }

  /**
   * Check if system is performing well
   */
  isPerformingWell() {
    const summary = this.getSummary();
    
    for (const [operation, stats] of Object.entries(summary.operations)) {
      if (stats.count > 5 && stats.slowPercentage > 30) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get performance alerts
   */
  getAlerts() {
    const alerts = [];
    const summary = this.getSummary();
    
    Object.entries(summary.operations).forEach(([operation, stats]) => {
      if (stats.count > 5) {
        if (stats.slowPercentage > 50) {
          alerts.push({
            level: 'critical',
            operation,
            message: `${operation} is critically slow (${stats.slowPercentage}% above target)`
          });
        } else if (stats.slowPercentage > 30) {
          alerts.push({
            level: 'warning',
            operation,
            message: `${operation} is performing poorly (${stats.slowPercentage}% above target)`
          });
        }
      }
    });
    
    return alerts;
  }

  /**
   * Start periodic monitoring
   */
  startPeriodicMonitoring(intervalMs = 60000) {
    setInterval(() => {
      const alerts = this.getAlerts();
      
      if (alerts.length > 0) {
        console.log('\n🚨 PERFORMANCE ALERTS:');
        alerts.forEach(alert => {
          const emoji = alert.level === 'critical' ? '🔴' : '🟡';
          console.log(`${emoji} ${alert.message}`);
        });
      }
      
      // Log summary every 5 minutes
      if (Date.now() % (5 * 60 * 1000) < intervalMs) {
        this.logSummary();
      }
    }, intervalMs);
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Start monitoring in production
if (process.env.NODE_ENV === 'production') {
  performanceMonitor.startPeriodicMonitoring();
}

module.exports = performanceMonitor;