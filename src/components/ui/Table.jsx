import { cn } from "../../lib/utils";
import styles from "./Table.module.css";

export const Table = ({ headers, data, renderRow, className }) => {
  return (
    <div className={cn(styles.tableContainer, className)}>
      <table className={styles.table}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, i) => <tr key={i}>{renderRow(item)}</tr>)
          ) : (
            <tr>
              <td colSpan={headers.length} className={styles.empty}>
                No entries available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
