import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Alert } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const Transactions = () => {
  const [transactions, setTransactions] = useState({
    error: "",
    loading: false,
    data: []
  });

  const [page, setPage] = useState(1);
  const [sender, setSender] = useState('Bob');
  const [totalPages, setTotalPages] = useState(1);

  let searchTxn = async (val) => {
    setTransactions({
      loading: true,
      error: "",
      data: null
    })

    try {
      const response = await axios.get(`http://localhost:8070/api/v1/transaction/search?page=${page}&param=${val}`);
      
      setTransactions({
        loading: false,
        error: "",
        data: response.data.data.rows
      })
      setTotalPages(Math.ceil(response.data.data.count / 10));
    } catch (error) {
      if(error.response) {
        if(error.response.data) {
          const message = error.response?.data?.message

          setError(message)
          return
        }
      }
      
      setError("Something went wrong");
    }
  }

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`http://localhost:8070/api/v1/transaction/get?page=${page}`);
        setTransactions({
          loading: false,
          error: "",
          data: response.data.data.rows
        })
        setTotalPages(Math.ceil(response.data.data.count / 10));
      } catch (error) {
        if(error.response) {
          if(error.response.data) {
            const message = error.response?.data?.message

            setError(message)
            return
          }
        }
        
        setError("Something went wrong");
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, [page, sender]);

  const setError = (message) => {
    setTransactions({
      loading: false,
      error: message,
      data: null
    })
  }

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className='container'>
      <div className='header-txn'>
        <h2>My Transactions</h2>
      </div>
      <div className='my-txn-container'>
        <input type="text" placeholder='Search here...' onChange={(e) => searchTxn(e.target.value)} />
        {
          transactions.loading && <CircularProgress />
        }
        {
          transactions.error !== "" && <Alert severity='error'>{transactions.error}</Alert>
        }
        
       {(transactions.error === "" && transactions.loading === false ) && <> <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Sender</TableCell>
                <TableCell>Receiver</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Cause</TableCell>
                <TableCell>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.data.map((transaction) => (
                <TableRow key={transaction.transactionID}>
                  <TableCell>{transaction.transactionID}</TableCell>
                  <TableCell>{transaction.sender}</TableCell>
                  <TableCell>{transaction.receiver}</TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>{transaction.currency}</TableCell>
                  <TableCell>{(transaction.receiver === sender || transaction.cause === 'Topup') ? <ArrowDownwardIcon className="receiver" /> : <ArrowUpwardIcon className="sender" />}</TableCell>
                  <TableCell>{transaction.cause}</TableCell>
                  <TableCell>{new Date(transaction.createdAt).toDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <div style={{ marginTop: '20px' }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button key={i} onClick={() => handlePageChange(i + 1)} variant={page === i + 1 ? 'contained' : 'outlined'}>
              {i + 1}
            </Button>
          ))}
        </div>
        </>}
      </div>

    </div>
  );
};

export default Transactions;