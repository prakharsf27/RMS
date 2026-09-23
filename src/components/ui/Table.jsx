'use client';
import { cn } from "../../lib/utils";
import styles from "./Table.module.css";

export const Table = ({ headers, data, renderRow, className }) => {
  return (
    <div className={cn(styles.tableContainer, className)}>
      <table className={styles.table}>
        <thead>
          <tr>
            {(Array.isArray(headers) ? headers : []).map((h, i) => (
              <th key={i} className={i === 0 && typeof h !== 'string' ? styles.selectionCell : ''}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.length > 0 ? (
            data.map((item, i) => renderRow(item, i))
          ) : (
            <tr>
              <td colSpan={Array.isArray(headers) ? headers.length : 1} className={styles.empty}>
                No entries available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
