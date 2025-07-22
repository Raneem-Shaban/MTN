const DynamicTable = ({ columns, data, onRowClick }) => {
  return (
    <div
      className="overflow-auto rounded-2xl shadow p-4"
      style={{
        backgroundColor: 'var(--color-bg)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      <table
        className="min-w-full divide-y"
        style={{ borderColor: 'var(--color-text-muted)' }}
      >
        <thead style={{ backgroundColor: 'var(--color-bg)' }}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.accessor}
                className="px-4 py-2 text-left text-sm font-semibold"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          className="divide-y"
          style={{ borderColor: 'var(--color-text-muted)' }}
        >
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className="cursor-pointer transition hover:[background-color:var(--color-light-gray)]"
            >
              {columns.map((col) => (
                <td
                  key={col.accessor}
                  className="px-4 py-2 whitespace-nowrap"
                  style={{ color: 'var(--color-text-main)' }}
                >
                  {typeof col.cell === 'function'
                    ? col.cell(row[col.accessor], row)
                    : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default DynamicTable;
