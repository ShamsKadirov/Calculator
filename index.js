(function () {
  "use strict";

  const expressionEl = document.getElementById("expression");
  const resultEl = document.getElementById("result");

  let current = "0";        // число, которое сейчас набираем / результат
  let accumulator = null;   // ранее введённое число перед оператором
  let operator = null;      // выбранный оператор: + - * /
  let waitingForOperand = false; // ждём ввод нового числа после оператора или равно

  const MAGIC = 888; // фича: 0 * 0 = 888

  function refresh() {
    resultEl.textContent = format(current);
    if (accumulator !== null && operator) {
      expressionEl.textContent = format(accumulator) + " " + opSymbol(operator);
    } else {
      expressionEl.textContent = "\u00A0";
    }
  }

  function format(n) {
    if (!isFinite(n)) return "Ошибка";
    return String(n);
  }

  function opSymbol(op) {
    return { "+": "+", "-": "−", "*": "×", "/": "÷" }[op] || "";
  }

  function inputDigit(d) {
    if (waitingForOperand) {
      current = d;
      waitingForOperand = false;
    } else {
      current = current === "0" ? d : current + d;
    }
  }

  function inputDot() {
    if (waitingForOperand) {
      current = "0.";
      waitingForOperand = false;
      return;
    }
    if (!current.includes(".")) current += ".";
  }

  function setOperator(nextOp) {
    if (operator && !waitingForOperand) {
      compute();
    }

    accumulator = parseFloat(current);
    operator = nextOp;
    waitingForOperand = true;

    highlightOperator();
    refresh();
  }

  function compute() {
    if (operator === null) return;

    const a = accumulator;
    const b = parseFloat(current);
    let result;

    // Особая фича: 0 * 0 = 888
    if (operator === "*" && a === 0 && b === 0) {
      result = MAGIC;
    } else if (operator === "+") {
      result = a + b;
    } else if (operator === "-") {
      result = a - b;
    } else if (operator === "*") {
      result = a * b;
    } else if (operator === "/") {
      result = b === 0 ? NaN : a / b;
    }

    result = trimFloat(result);
    current = String(result);
    accumulator = null;
    operator = null;
    waitingForOperand = true;
  }

  function trimFloat(n) {
    if (!isFinite(n)) return n;
    return parseFloat(n.toPrecision(12));
  }

  function equals() {
    if (operator === null || waitingForOperand) return;
    compute();
    expressionEl.textContent = "\u00A0";
    highlightOperator();
    refresh();
  }

  function percent() {
    if (operator === "*" || operator === "/") {
      current = String(parseFloat(current) / 100);
    } else {
      current = String((accumulator ?? 0) * parseFloat(current) / 100);
    }
    refresh();
  }

  function clear() {
    current = "0";
    accumulator = null;
    operator = null;
    waitingForOperand = false;
    highlightOperator();
    refresh();
  }

  function backspace() {
    if (waitingForOperand) return;
    if (current.length > 1) {
      current = current.slice(0, -1);
    } else {
      current = "0";
    }
    refresh();
  }

  function highlightOperator() {
    document.querySelectorAll(".btn--op").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.op === operator);
    });
  }

  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.num !== undefined) inputDigit(btn.dataset.num);
      else if (btn.dataset.action === "dot") inputDot();
      else if (btn.dataset.action === "clear") clear();
      else if (btn.dataset.action === "backspace") backspace();
      else if (btn.dataset.action === "percent") percent();
      else if (btn.dataset.action === "equals") equals();
      else if (btn.dataset.op) setOperator(btn.dataset.op);
      refresh();
    });
  });

  document.addEventListener("keydown", (e) => {
    const k = e.key;
    if (/^[0-9]$/.test(k)) inputDigit(k);
    else if (k === ".") inputDot();
    else if (k === "+" || k === "-" || k === "*" || k === "/") {
      e.preventDefault();
      setOperator(k);
    } else if (k === "Enter" || k === "=") equals();
    else if (k === "Backspace") backspace();
    else if (k === "Escape") clear();
    else if (k === "%") percent();
    else return;

    highlightOperator();
    refresh();
  });

  refresh();
})();
