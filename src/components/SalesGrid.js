import React, { useEffect } from "react"
import { AgGridReact } from "ag-grid-react/lib/agGridReact"
import moment from "moment"
import axios from "axios"
import _ from "lodash"
import crypto from "crypto"
import "./SalesGrid.css"

let gridApi

const SalesGrid = ({
  originData,
  defaultData,
  setDefaultData,
  fetchMonthSalesData,
  todayMap,
  setTodayMap,
}) => {
  useEffect(() => {
    const res = _.sumBy(defaultData.rowData, (value) => {
      return Number(value.tableCount)
    })
    console.log(res)
  }, [
    defaultData.rowData,
    _.sum([...defaultData.rowData.map((value) => value.tableCount)]),
  ])
  let onGridReady = (params) => {
    gridApi = params.api
  }

  const handleClickNewRow = () => {
    const { rowData } = defaultData
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
    setDefaultData({
      ...defaultData,
      rowData: defaultData.rowData.concat({
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
      }),
    })
  }

  const handleSaveSalesGrid = async (e) => {
    e.preventDefault()
    let difference = _.differenceWith(
      defaultData.rowData,
      originData,
      _.isEqual
    )
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
    let difference = _.differenceWith(
      defaultData.rowData,
      deleteList,
      _.isEqual
    )
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
    setDefaultData({ ...defaultData, rowData: difference })
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
        평균 테이블 수: {} 평균 카드 매출: {} 평균 현금 매출: {}평균 서비스
        매출: {} 평균 객단가: {} 총 매출액: {}
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
            columnDefs={defaultData.columnDefs}
            rowData={defaultData.rowData}
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
