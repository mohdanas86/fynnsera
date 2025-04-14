"use client";

import React, { useRef, useEffect, useState } from "react";
import $ from "jquery";
import moment from "moment";
import "daterangepicker/daterangepicker.css";
import "daterangepicker";

const displayFormat = "MMM DD, YYYY";

export function DatePickerWithRange({ defaultRange, onChange, className }) {
  const inputRef = useRef(null);
  // Use a ref to track if a new date range has been selected.
  const hasUserSelected = useRef(false);

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

    // Remove any previous instance before reinitializing
    if ($input.data("daterangepicker")) {
      $input.data("daterangepicker").remove();
    }

    $input.daterangepicker(
      {
        startDate: selectedRange.from.clone(),
        endDate: selectedRange.to.clone(),
        opens: "left",
        autoUpdateInput: true,
        timePicker: false,
        locale: {
          cancelLabel: "Clear", // Show Clear button
        },
      },
      (start, end) => {
        const newFrom = start.clone().startOf("day");
        const newTo = end.clone().endOf("day");

        // If the selected dates are the same as the current ones, do nothing.
        if (
          newFrom.isSame(selectedRange.from, "day") &&
          newTo.isSame(selectedRange.to, "day")
        )
          return;

        const newRange = { from: newFrom, to: newTo };
        setSelectedRange(newRange);
        // Mark that a new selection has been made.
        hasUserSelected.current = true;
        onChange?.({ from: newFrom.toDate(), to: newTo.toDate() });
      }
    );

    // Handle the cancel (Clear) button click.
    $input.on("cancel.daterangepicker", function (ev, picker) {
      if (!hasUserSelected.current) {
        // If no new date range was selected, revert to the current selected range.
        picker.setStartDate(selectedRange.from);
        picker.setEndDate(selectedRange.to);
        picker.hide();
        return;
      }
      // Reset to the default range provided via props.
      const defaultFrom = defaultRange?.from
        ? moment(defaultRange.from).startOf("day")
        : moment().startOf("month");
      const defaultTo = defaultRange?.to
        ? moment(defaultRange.to).endOf("day")
        : moment().endOf("month");

      picker.setStartDate(defaultFrom);
      picker.setEndDate(defaultTo);
      setSelectedRange({ from: defaultFrom, to: defaultTo });
      onChange?.({ from: defaultFrom.toDate(), to: defaultTo.toDate() });
      // Reset the flag.
      hasUserSelected.current = false;
    });

    return () => {
      $input.off("cancel.daterangepicker");
      if ($input.data("daterangepicker")) {
        $input.data("daterangepicker").remove();
      }
    };
  }, [selectedRange.from, selectedRange.to, onChange, defaultRange]);

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
