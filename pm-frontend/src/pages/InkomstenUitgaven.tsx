import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

// import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

import { Betaling } from '../model/Betaling';
import { useEffect, useState, useCallback, Fragment } from 'react';

import { useAuthContext } from "@asgardeo/auth-react";
import { TableFooter, TablePagination, Typography } from '@mui/material';
import { useCustomContext } from '../context/CustomContext';
import TablePaginationActions from '../components/TablePaginationActions';
// import InkomenIcon from '../icons/Inkomen';
// import VariabeleLastenIcon from '../icons/VariabeleLasten';

export default function InkomstenUitgaven() {
  const { getIDToken } = useAuthContext();
  const { gebruiker, actieveHulpvrager } = useCustomContext();

  const [betalingen, setBetalingen] = useState<Betaling[]>([])
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [isLoading, setIsLoading] = useState(false);
  // const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  // const [popoverId, setPopoverId] = useState<number | null>(null);

  const currencyFormatter = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  });
  const dateFormatter = (date: string) => {
    return new Intl.DateTimeFormat('nl-NL', { month: "short", day: "numeric" }).format(Date.parse(date))
  }
  const betalingsSoortFormatter = (betalingsSoort: string): string => {
    return betalingsSoort.replace('_', ' ').toLowerCase()
  }

  const fetchBetalingen = useCallback(async () => {
    if (gebruiker) {
      setIsLoading(true);
      const token = await getIDToken();
      const id = actieveHulpvrager ? actieveHulpvrager.id : gebruiker?.id
      const response = await fetch(`/api/v1/betalingen/hulpvrager/${id}?size=${rowsPerPage}&page=${page}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setIsLoading(false);
      if (response.ok) {
        const result = await response.json();
        setBetalingen(result.data.content);
        setCount(result.data.page.totalElements)
      } else {
        console.error("Failed to fetch data", response.status);
      }
    }
  }, [getIDToken, page, rowsPerPage, actieveHulpvrager, gebruiker]);

  useEffect(() => {
    fetchBetalingen();
  }, [fetchBetalingen, page, rowsPerPage]);

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);

  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>, id: number) => {
  //   setAnchorEl(event.currentTarget);
  //   setPopoverId(id);
  // };
  // const handlePopoverClose = () => {
  //   setAnchorEl(null);
  //   setPopoverId(null);
  // };

  if (isLoading) {
    return <Typography sx={{ mb: '25px' }}>De betalingen worden opgehaald.</Typography>
  }

  return (
    <>
      <Typography variant='h4'>Inkomsten & uitgaven</Typography>
      <Typography variant='h6'>Dagboek weergave</Typography>
      {!isLoading && betalingen.length === 0 &&
        <Typography sx={{ mb: '25px' }}>Je ({actieveHulpvrager ? actieveHulpvrager.bijnaam : gebruiker?.bijnaam}) hebt nog geen betalingen geregistreerd.</Typography>
      }
      {!isLoading && betalingen.length > 0 &&
        <>
          <Typography sx={{ mb: '25px' }}>De betalingen voor {actieveHulpvrager ? actieveHulpvrager.bijnaam : gebruiker?.bijnaam} worden getoond.</Typography>
          <TableContainer component={Paper} sx={{ maxWidth: "xl", m: 'auto', my: '10px' }}>
            <Table sx={{ width: "100%" }} aria-label="simple table">
              <colgroup>
                <col width="10%" />
                <col width="10%" />
                <col width="35%" />
                <col width="15%" />
                <col width="15%" />
                <col width="15%" />
              </colgroup>
              <TableHead>
                <TableRow>
                  <TableCell>&nbsp;</TableCell>
                  <TableCell align="right">&euro;</TableCell>
                  <TableCell>Omschrijving</TableCell>
                  <TableCell>Betalingssoort</TableCell>
                  <TableCell>Rekening</TableCell>
                  <TableCell>Betaalmethode</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {betalingen.map((betaling) => (
                  <Fragment key={betaling.id}>
                    <TableRow
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      // aria-owns={popoverId === betaling.id ? `popover-${betaling.id}` : undefined}
                      aria-haspopup="true"
                      // onMouseEnter={(event) => handlePopoverOpen(event, betaling.id)}
                      // onMouseLeave={handlePopoverClose}
                    >
                      <TableCell align="left" size='small' sx={{ p: "6px" }}>{dateFormatter(betaling["boekingsdatum"])}</TableCell>
                      <TableCell align="right" size='small' sx={{ p: "6px" }}>{currencyFormatter.format(betaling["bedrag"])}</TableCell>
                      <TableCell align="left" size='small' sx={{ p: "6px" }}>{betaling["omschrijving"]}</TableCell>
                      <TableCell align="left" size='small' sx={{ p: "6px" }}>{betalingsSoortFormatter(betaling["betalingsSoort"]!)}</TableCell>
                      <TableCell align="left" size='small' sx={{ p: "6px" }}>{
                      betaling["betalingsSoort"] === 'INKOMSTEN' ? betaling["bron"]?.naam : betaling["bestemming"]?.naam
                      }</TableCell>
                      <TableCell align="left" size='small' sx={{ p: "6px" }}>{
                      betaling["betalingsSoort"] === 'INKOMSTEN' ? betaling["bestemming"]?.naam : betaling["bron"]?.naam
                      }</TableCell>
                    </TableRow>
                    {/* <Popover
                      id={`popover-${betaling.id}`}
                      sx={{
                        pointerEvents: 'none',
                        "& .MuiPaper-root": {
                          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                          width: "75%",
                          maxWidth: "75%",
                        },
                      }}
                      open={popoverId === betaling.id}
                      anchorEl={anchorEl}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                      }}
                      onClose={handlePopoverClose}
                      disableRestoreFocus
                    >
                      <Typography sx={{ p: 1 }}>
                        { betaling.bron && "afgeschreven van: {betaling.bron?.naam}<br />" }
                        { betaling.bestemming && 'bijgeschreven bij: {betaling.bestemming?.naam}<br />' }
                        bank_informatie zou hier komenn<br />
                      </Typography>
                    </Popover> */}
                  </Fragment>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                    labelRowsPerPage={""}
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
                    sx={{
                      width: "300px",
                      margin: "0 auto",
                      overflow: "hidden",
                    }}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </>}
    </>
  );
}
