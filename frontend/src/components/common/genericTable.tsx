import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, TablePagination } from '@mui/material';

type Column = {
  field: string;
  headerName: string;
  render?: (row: any) => React.ReactNode;
};

type Props = {
  columns: Column[];
  data: any[];
  onActionClick?: (row: any) => void;
};

const GenericTable: React.FC<Props> = ({ columns, data }) => {
  const theme = useTheme();
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleToggle = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (data.length === 0) {
    return (
      <div className="table-empty">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <Box className="table-wrapper">
      {/* Desktop Table */}
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="table-header">
                {col.headerName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, idx) => (
            <tr key={idx} className="table-row">
              {columns.map((col, cidx) => (
                <td
                  key={cidx}
                  className="table-cell"
                  style={{ color: theme.palette.text.primary }}
                >
                  {col.render ? col.render(row) : row[col.field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <TablePagination
        component="div"
        count={data.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Rows per page"
      />

      {/* Mobile Cards */}
      <Box className="mobile-cards">
        {paginatedData.map((row, rowIdx) => {
          const actualIndex = rowIdx + page * rowsPerPage;

          return (
            <Box
              key={actualIndex}
              className={`mobile-card ${expandedIndex === actualIndex ? 'expanded' : ''}`}
              onClick={() => handleToggle(actualIndex)}
              sx={{ cursor: 'pointer' }}
            >
              {/* Always Visible Fields */}
              {columns
                .filter(
                  (col, index) =>
                    index < 2 || ['Status','Type'].includes(col.headerName)
                )
                .map((col, colIdx) => (
                  <Box key={colIdx} className="mobile-card-row">
                    <Box component="span" className="mobile-label">
                      {col.headerName}:
                    </Box>
                    <Box component="span" className="mobile-value">
                      {col.render ? col.render(row) : row[col.field]}
                    </Box>
                  </Box>
                ))}

              {/* Toggle-able Hidden Fields */}
              {expandedIndex === actualIndex && (
                <Box className="mobile-card-details">
                  {columns
                    .filter(
                      (col, index) =>
                        !(
                          index < 2 ||
                          ['Status','Type'].includes(col.headerName)
                        )
                    )
                    .map((col, colIdx) => (
                      <Box key={colIdx} className="mobile-card-row">
                        <Box component="span" className="mobile-label">
                          {col.headerName}:
                        </Box>
                        <Box component="span" className="mobile-value">
                          {col.render ? col.render(row) : row[col.field]}
                        </Box>
                      </Box>
                    ))}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default GenericTable;
