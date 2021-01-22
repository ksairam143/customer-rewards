import React, { useState, useEffect } from "react";
import fetch from './api/dataService';
import ReactTable from 'react-table';
import "react-table/react-table.css";
import styled from 'styled-components';
import "./App.css";
import _ from 'lodash';

// Create a <HTMLTag> react component that renders an <div>
const Container = styled.div`
height: 80%
text-align: center;
color: palevioletred;
width: 100%;
position: fixed; /* or absolute */
top: 28%;
left: 18%;
`;

function getResults(data) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pointsPerTransaction = data.map(transaction => {
    let points = 0;
    let over100 = transaction.amount - 100;
    if (over100 > 0) {
      points += (over100 * 2);
    }
    if (transaction.amount > 50) {
      points += 50;
    }
    const month = new Date(transaction.transactionDate).getMonth();
    return { ...transaction, points, month };
  });

  let byCustomer = {};
  let totalPointsByCustomer = {};
  pointsPerTransaction.forEach(pointsPerTransaction => {
    let { customerId, name, month, points } = pointsPerTransaction;
    if (!byCustomer[customerId]) {
      byCustomer[customerId] = [];
    }
    if (!totalPointsByCustomer[customerId]) {
      totalPointsByCustomer[name] = 0;
    }
    totalPointsByCustomer[name] += points;
    if (byCustomer[customerId][month]) {
      byCustomer[customerId][month].points += points;
      byCustomer[customerId][month].monthNumber = month;
      byCustomer[customerId][month].numTransactions++;
    }
    else {
      byCustomer[customerId][month] = {
        customerId,
        name,
        monthNumber: month,
        month: months[month],
        numTransactions: 1,
        points
      }
    }
  });
  let tot = [];
  for (var custKey in byCustomer) {
    byCustomer[custKey].forEach(cRow => {
      tot.push(cRow);
    });
  }
  let totByCustomer = [];
  for (custKey in totalPointsByCustomer) {
    totByCustomer.push({
      name: custKey,
      points: totalPointsByCustomer[custKey]
    });
  }
  return {
    summaryByCustomer: tot,
    pointsPerTransaction,
    totalPointsByCustomer: totByCustomer
  };
}

function App() {
  const [transactionData, setTransactionData] = useState(null);

  const columns = [
    {
      Header: 'Customer',
      accessor: 'name'
    },
    {
      Header: 'Month',
      accessor: 'month'
    },
    {
      Header: "# of Transactions",
      accessor: 'numTransactions'
    },
    {
      Header: 'Reward Points',
      accessor: 'points'
    }
  ];

  function getIndividualTransaction(row) {
    let byCustMonth = _.filter(transactionData.pointsPerTransaction, (tRow) => {
      return row.original.customerId === tRow.customerId && row.original.monthNumber === tRow.month;
    });
    return byCustMonth;
  }

  useEffect(() => {
    fetch().then((data) => {
      const results = getResults(data);
      setTransactionData(results);
    });
  }, []);

  if (transactionData == null) {
    return <div></div>;
  }

  return (
    <Container>
      <div className="row">
        <div className="col-10">
          <h2>Point Rewards System Totals by Customer Months</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-8">
          <ReactTable
            data={transactionData.summaryByCustomer}
            defaultPageSize={5}
            pageSizeOptions={[4, 6, 8]}
            columns={columns}
            SubComponent={row => {
              return (
                <div>
                  {getIndividualTransaction(row).map(tran => {
                    return <div className="container">
                      <div className="row">
                        <div className="col-8">
                          <strong>Transaction Date:</strong> {tran.transactionDate} - <strong>$</strong>{tran.amt} - <strong>Points: </strong>{tran.points}
                        </div>
                      </div>
                    </div>
                  })}
                </div>
              )
            }}
          />
        </div>
      </div>
    </Container>)
}

export default App;
