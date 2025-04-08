"use client";

import React, { useRef, useEffect, useState } from "react";
import $ from "jquery";
import moment from "moment";
import "daterangepicker/daterangepicker.css";
import "daterangepicker";

const displayFormat = "MMM DD, YYYY";

export function DatePickerWithRange({ defaultRange, onChange, className }) {
  const inputRef = useRef(null);

  const [selectedRange, setSelectedRange] = useState(() => {
    const from = defaultRange?.from
      ? moment(defaultRange.from)
      : moment().startOf("month");
    const to = defaultRange?.to
      ? moment(defaultRange.to)
      : moment().endOf("month");

    return { from, to };
  });

  useEffect(() => {
    const $input = $(inputRef.current);

    if ($input.data("daterangepicker")) {
      $input.data("daterangepicker").remove();
    }

    $input.daterangepicker(
      {
        startDate: selectedRange.from.clone(),
        endDate: selectedRange.to.clone(),
        opens: "right",
        autoUpdateInput: true,
        timePicker: false,
        locale: {
          format: displayFormat,
          cancelLabel: "Clear",
        },
      },
      (start, end) => {
        const newFrom = start.clone().startOf("day");
        const newTo = end.clone().endOf("day");

        if (
          newFrom.isSame(selectedRange.from, "day") &&
          newTo.isSame(selectedRange.to, "day")
        )
          return;

        const newRange = { from: newFrom, to: newTo };
        setSelectedRange(newRange);
        onChange?.({ from: newFrom.toDate(), to: newTo.toDate() });
      }
    );

    $input.on("cancel.daterangepicker", function () {
      $input.val("");
      setSelectedRange({ from: null, to: null });
      onChange?.({ from: null, to: null });
    });

    return () => {
      $input.off("cancel.daterangepicker");
      if ($input.data("daterangepicker")) {
        $input.data("daterangepicker").remove();
      }
    };
  }, [selectedRange.from, selectedRange.to, onChange]);

  useEffect(() => {
    if (defaultRange?.from && defaultRange?.to) {
      const newFrom = moment(defaultRange.from).startOf("day");
      const newTo = moment(defaultRange.to).endOf("day");
      setSelectedRange({ from: newFrom, to: newTo });
    }
  }, [defaultRange]);

  return (
    <input
      type="text"
      ref={inputRef}
      readOnly
      className={`px-3 py-2 border border-gray-300 rounded-sm text-sm bg-white ${
        className || ""
      }`}
      style={{ minWidth: "200px" }}
      value={
        selectedRange.from && selectedRange.to
          ? `${selectedRange.from.format(
              displayFormat
            )} - ${selectedRange.to.format(displayFormat)}`
          : ""
      }
    />
  );
}
