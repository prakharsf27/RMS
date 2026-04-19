'use client';
import styles from "./Chart.module.css";

/**
 * A highly stylized, simulated Chart component using SVG and CSS Grid.
 * Built for high-fidelity recruitment analytics dashboards.
 */
export const BarChart = ({ data, title, height = 240 }) => {
  const maxVal = Math.max(...data.map(d => d.value));

  return (
    <div className={styles.chartContainer} style={{ height }}>
      <p className={styles.chartTitle}>{title}</p>
      <div className={styles.barArea}>
        {data.map((item, i) => {
          const percentage = (item.value / maxVal) * 100;
          return (
            <div key={i} className={styles.barGroup}>
              <div className={styles.barWrapper}>
                <div 
                  className={styles.barFill} 
                  style={{ 
                    height: `${percentage}%`,
                    backgroundColor: item.color || 'var(--primary)',
                    animationDelay: `${i * 0.1}s`
                  }}
                >
                  <span className={styles.barValue}>{item.value}</span>
                </div>
              </div>
              <span className={styles.barLabel}>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const PieChart = ({ data, title, size = 200 }) => {
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className={styles.pieContainer}>
       <p className={styles.chartTitle}>{title}</p>
       <div className={styles.pieWrapper} style={{ width: size, height: size }}>
          <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }}>
            {data.map((slice, i) => {
              const startPercent = cumulativePercent;
              const endPercent = cumulativePercent + slice.value;
              cumulativePercent += slice.value;

              const [startX, startY] = getCoordinatesForPercent(startPercent);
              const [endX, endY] = getCoordinatesForPercent(endPercent);

              const largeArcFlag = slice.value > 0.5 ? 1 : 0;
              const pathData = [
                `M ${startX} ${startY}`,
                `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                `L 0 0`,
              ].join(' ');

              return (
                <path 
                  key={i} 
                  d={pathData} 
                  fill={slice.color} 
                  className={styles.pieSlice} 
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              );
            })}
          </svg>
          <div className={styles.pieOverlay}></div>
       </div>
       <div className={styles.legend}>
          {data.map((slice, i) => (
            <div key={i} className={styles.legendItem}>
               <div className={styles.dot} style={{ backgroundColor: slice.color }}></div>
               <span>{slice.label}</span>
            </div>
          ))}
       </div>
    </div>
  );
};
