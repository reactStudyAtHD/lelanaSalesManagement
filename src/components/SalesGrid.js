import React from "react"
import { AgGridReact } from "ag-grid-react/lib/agGridReact"
import moment from "moment"
import axios from "axios"
import _ from "lodash"
import crypto from "crypto"
import "./SalesGrid.css"
import { calculateUnitPrice, calculateAllSales } from "../util/sales/calculate"

let gridApi

const SalesGrid = ({
  originData,
  rowData,
  setRowData,
  fetchMonthSalesData,
  todayMap,
  setTodayMap,
}) => {
  const columnDefs = [
    {
      checkboxSelection: true,
      width: 50,
    },
    {
      headerName: "날짜",
      field: "saleDate",
    },
    {
      headerName: "서비스 매출",
      field: "serviceSales",
      editable: true,
      valueSetter(params) {
        if (params.data.serviceSales !== params.newValue) {
          params.data.serviceSales = Number(params.newValue)
          let list = []
          gridApi.forEachNode((node) => list.push(node.data))
          setRowData(list)
          return true
        } else {
          return false
        }
      },
      valueFormatter(params) {
        return params.value.toLocaleString()
      },
    },
    {
      headerName: "현금 매출",
      field: "moneySales",
      editable: true,
      valueSetter(params) {
        if (params.data.moneySales !== params.newValue) {
          params.data.moneySales = Number(params.newValue)
          let list = []
          gridApi.forEachNode((node) => list.push(node.data))
          setRowData(list)
          return true
        } else {
          return false
        }
      },
      valueFormatter(params) {
        return params.value.toLocaleString()
      },
    },
    {
      headerName: "카드 매출",
      field: "cardSales",
      editable: true,
      valueSetter(params) {
        if (params.data.cardSales !== params.newValue) {
          params.data.cardSales = Number(params.newValue)
          let list = []
          gridApi.forEachNode((node) => list.push(node.data))
          setRowData(list)
          return true
        } else {
          return false
        }
      },
      valueFormatter(params) {
        return params.value.toLocaleString()
      },
    },
    {
      headerName: "테이블 수",
      field: "tableCount",
      editable: true,
      valueSetter(params) {
        if (params.data.tableCount !== params.newValue) {
          params.data.tableCount = Number(params.newValue)
          let list = []
          gridApi.forEachNode((node) => list.push(node.data))
          setRowData(list)
          return true
        } else {
          return false
        }
      },
      valueFormatter(params) {
        return params.value.toLocaleString()
      },
    },
    {
      headerName: "총 매출",
      valueGetter(params) {
        return calculateAllSales(params) % 1 === 0
          ? calculateAllSales(params).toLocaleString()
          : calculateAllSales(params).toFixed(1).toLocaleString()
      },
    },
    {
      headerName: "객단가",
      valueGetter(params) {
        return calculateUnitPrice(params) % 1 === 0
          ? calculateUnitPrice(params).toLocaleString()
          : calculateUnitPrice(params).toFixed(1).toLocaleString()
      },
    },
  ]

  const getAverageValue = (rowData, salesValue) => {
    return _.sumBy(rowData, (value) => {
      if (rowData.length === 0) return 0

      if (salesValue === "serviceSales") {
        return Number(value.serviceSales) / rowData.length
      } else if (salesValue === "moneySales") {
        return Number(value.moneySales) / rowData.length
      } else if (salesValue === "cardSales") {
        return Number(value.cardSales) / rowData.length
      } else if (salesValue === "tableCount") {
        return Number(value.tableCount) / rowData.length
      }
    })
  }

  const serviceSalesAverage = getAverageValue(rowData, "serviceSales")
  const moneySalesAverage = getAverageValue(rowData, "moneySales")
  const cardSalesAverage = getAverageValue(rowData, "cardSales")
  const tableCountAverage = getAverageValue(rowData, "tableCount")
  const allSales = _.sumBy(rowData, (value) => {
    return (
      Number(value.serviceSales) +
      Number(value.moneySales) +
      Number(value.cardSales)
    )
  })
  const unitPriceAverage =
    _.sumBy(rowData, (value) => {
      return Number(value.tableCount)
    }) === 0
      ? 0
      : allSales /
        _.sumBy(rowData, (value) => {
          return Number(value.tableCount)
        })

  let onGridReady = (params) => {
    gridApi = params.api
  }

  const handleClickNewRow = () => {
    const { year, month } = todayMap
    let date

    if (rowData.length === 0) {
      const monthString = month < 10 ? `0${month}` : month
      date = moment(`${year}-${monthString}-01`, "YYYY-MM-DD").format(
        "YYYY-MM-DD"
      )
    } else {
      date = moment(rowData[rowData.length - 1].saleDate, "YYYY-MM-DD")
        .add(1, "day")
        .format("YYYY-MM-DD")
    }
    setRowData(
      rowData.concat({
        saleId: crypto
          .createHash("md5")
          .update(`${year}-${month}-${date}`)
          .digest("hex"),
        saleYear: year,
        saleMonth: month,
        tableCount: 0,
        cardSales: 0,
        moneySales: 0,
        serviceSales: 0,
        saleDate: date,
      })
    )
  }

  const handleSaveSalesGrid = async (e) => {
    e.preventDefault()
    let difference = _.differenceWith(rowData, originData, _.isEqual)
    if (difference.length > 0) {
      difference = difference.map((value) => {
        if (Number.isNaN(Number(value.saleId))) {
          return {
            ...value,
            saleId: null,
          }
        }
        return value
      })
    }
    try {
      await axios.post("http://ctk0327.iptime.org:8080/sales", difference)
    } catch (e) {
      console.error(e)
    }
  }

  const handleRemoveSelectedRows = async () => {
    const deleteList = gridApi.getSelectedRows()
    const realDbDataList = deleteList.filter(
      (value) => !Number.isNaN(Number(value.saleId))
    )
    if (deleteList.length === 0) {
      alert("삭제할 것을 선택해주세요")
      return
    }
    let difference = _.differenceWith(rowData, deleteList, _.isEqual)
    for (let i = 0; i < realDbDataList.length; i++) {
      try {
        const deleteObject = realDbDataList[i]
        await axios.delete("http://ctk0327.iptime.org:8080/sale", {
          data: deleteObject,
        })
      } catch (e) {
        console.error(e)
      }
    }
    setRowData(difference)
  }

  const handlePreviousMonth = () => {
    const { year, month } = todayMap
    const monthString = month < 10 ? `0${month}` : month
    const date = moment(`${year}-${monthString}-01`, "YYYY-MM-DD")
      .subtract(1, "month")
      .format("YYYY MM")
    const dateList = date.split(" ")
    const saleYear = Number(dateList[0])
    const saleMonth = Number(dateList[1])

    fetchMonthSalesData({
      saleYear,
      saleMonth,
    })
    setTodayMap({ year: saleYear, month: saleMonth })
  }

  const handleNextMonth = () => {
    const { year, month } = todayMap
    const monthString = month < 10 ? `0${month}` : month
    const date = moment(`${year}-${monthString}-01`, "YYYY-MM-DD")
      .add(1, "month")
      .format("YYYY MM")
    const dateList = date.split(" ")
    const saleYear = Number(dateList[0])
    const saleMonth = Number(dateList[1])
    fetchMonthSalesData({
      saleYear,
      saleMonth,
    })
    setTodayMap({ year: saleYear, month: saleMonth })
  }

  return (
    <div className='SalesGrid'>
      <div className='SalesGrid-buttonArea'>
        <button onClick={handlePreviousMonth}>{"<<"}</button>
        {`${todayMap.year}년 ${todayMap.month}월`}
        <button onClick={handleNextMonth}>{">>"}</button>
      </div>
      <div className='SalesGrid-averageArea'>
        평균 테이블 수: {tableCountAverage.toLocaleString()} 평균 카드 매출:{" "}
        {cardSalesAverage.toLocaleString()} 평균 현금 매출:{" "}
        {moneySalesAverage.toLocaleString()}평균 서비스 매출:{" "}
        {serviceSalesAverage.toLocaleString()} 평균 객단가:{" "}
        {unitPriceAverage.toLocaleString()} 총 매출액:{" "}
        {allSales.toLocaleString()}
      </div>
      <div className='SalesGrid-gridArea'>
        <div
          className='ag-theme-balham'
          style={{
            height: "500px",
            width: "100%",
          }}
        >
          <AgGridReact
            columnDefs={columnDefs}
            rowData={rowData}
            rowSelection={"multiple"}
            onGridReady={onGridReady}
          ></AgGridReact>
        </div>
        <button onClick={handleClickNewRow}>새 행</button>
        <button onClick={handleSaveSalesGrid}>저장하기</button>
        <button onClick={handleRemoveSelectedRows}>선택삭제</button>
      </div>
    </div>
  )
}

export default SalesGrid
