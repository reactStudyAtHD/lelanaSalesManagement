import React, { useState, useEffect, useRef } from "react"

import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"

import "@fullcalendar/core/main.css"
import "@fullcalendar/daygrid/main.css"
import { calculateAllSales, calculateUnitPrice } from "../util/sales/calculate"

const SalesViewer = ({
  rowData,
  fetchMonthSalesData,
  defaultDate,
  setDefaultDate,
}) => {
  const calendarRef = useRef()
  const [events, setEvents] = useState(null)
  useEffect(() => {
    const events = rowData.map((value) => {
      const { cardSales, moneySales, serviceSales, tableCount } = value
      return {
        title: `
        총매출: ${calculateAllSales({
          cardSales,
          moneySales,
          serviceSales,
        }).toLocaleString()}원
        객단가: ${calculateUnitPrice({
          cardSales,
          moneySales,
          serviceSales,
          tableCount,
        }).toLocaleString()}원
      `,
        date: value.saleDate,
      }
    })
    setEvents(events)
  }, [rowData])

  const handleChangeMonthButton = (calendar, direction) => {
    let month
    if (direction === "prev") {
      calendar.prev()
      month = defaultDate.getMonth() - 1
    }
    if (direction === "next") {
      calendar.next()
      month = defaultDate.getMonth() + 1
    }
    const { title } = calendar.view
    const monthYearArray = title.split(" ").map((value) => parseInt(value))
    const params = {
      saleYear: monthYearArray[0],
      saleMonth: monthYearArray[1],
    }
    fetchMonthSalesData(params)
    setDefaultDate(new Date(defaultDate.setMonth(month)))
  }

  return (
    <div className='SalesViewer'>
      <FullCalendar
        header={{
          left: "title",
          right: "prevButton,nextButton",
        }}
        defaultDate={defaultDate}
        defaultView='dayGridMonth'
        customButtons={{
          prevButton: {
            text: "prev",
            click() {
              handleChangeMonthButton(calendarRef.current.calendar, "prev")
            },
          },
          nextButton: {
            text: "next",
            click() {
              handleChangeMonthButton(calendarRef.current.calendar, "next")
            },
          },
        }}
        plugins={[dayGridPlugin]}
        events={events}
        locale='ko'
        fixedWeekCount={true}
        showNonCurrentDates={true}
        ref={calendarRef}
      />
    </div>
  )
}

export default SalesViewer
