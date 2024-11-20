import { useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';

import { Betaling } from '../model/Betaling';
import { useEffect, useState, useCallback } from 'react';

import { useAuthContext } from "@asgardeo/auth-react";
import { Box, IconButton, TableFooter, TablePagination } from '@mui/material';

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number,
  ) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

export default function InkomstenUitgaven() {
  const { getIDToken } = useAuthContext();

  const [betalingen, setBetalingen] = useState<Betaling[]>([])
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const fetchBetalingen = useCallback(async () => {
    console.info(`In fetchbetalingen rpp: ${rowsPerPage}, p: ${page}`);
    const token = await getIDToken();
    const response = await fetch(`/api/v1/betalingen?size=${rowsPerPage}&page=${page}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (response.ok) {
      const result = await response.json();
      setBetalingen(result.data.content);
      setCount(result.data.page.totalElements)
    } else {
      console.error("Failed to fetch data", response.status);
    }
  }, [rowsPerPage, page]);
  
  useEffect(() => {
    console.info(`In useEffect rpp: ${rowsPerPage}, p: ${page}`);
    fetchBetalingen();
  }, [fetchBetalingen, page, rowsPerPage]);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
    event;
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <TableContainer component={Paper} sx={{ maxWidth: "xl", m: 'auto', my: '10px' }}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <colgroup>
          <col width="15%" />
          <col width="15%" />
          <col width="55%" />
          <col width="15%" />
        </colgroup>
        <TableHead>
          <TableRow>
            <TableCell>Boekingsdatum</TableCell>
            <TableCell align="right">Bedrag (&euro;)</TableCell>
            {/* <TableCell>Omschrijving bank</TableCell> */}
            <TableCell>Omschrijving</TableCell>
            <TableCell>Categorie</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {betalingen.map((betaling) => (
            <TableRow
              key={betaling.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="left" size='small'>{betaling["boekingsdatum"]}</TableCell>
              <TableCell align="right" size='small'>{betaling["bedrag"]}</TableCell>
              {/* <TableCell align="left">{betaling["omschrijving_bank"]}</TableCell> */}
              <TableCell align="left" size='small'>{betaling["omschrijving"]}</TableCell>
              <TableCell align="left" size='small'>{betaling["categorie"]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
              labelRowsPerPage={"Rijen per pagina"}
              colSpan={3}
              count={count}
              rowsPerPage={rowsPerPage}
              page={page}
              slotProps={{
                select: {
                  inputProps: {
                    'aria-label': 'Rijen per pagina',
                  },
                  native: true,
                },
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
      </Table>
      <hr/>
      <p>page: {page}</p>
      <p>rowsPerPage: {rowsPerPage}</p>
    </TableContainer>
  );
}
