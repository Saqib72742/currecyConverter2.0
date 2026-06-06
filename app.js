let exchangeData = null;

const amountInput = document.querySelector(".amountInput");
const result = document.querySelector(".output");
const resultBox = document.querySelector(".result");
const convertBtn = document.querySelector(".convert");
const selectFrom = document.querySelector("#amountFrom");
const selectTo = document.querySelector("#amountTo");

function showResult(message) {
    result.innerText = message;
    resultBox.classList.remove("updated");
    requestAnimationFrame(() => {
        resultBox.classList.add("updated");
    });
}

async function getRates(base = "USD") {
    try {
        const url = `https://open.er-api.com/v6/latest/${base}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data || !data.rates) {
            throw new Error("Rates not found");
        }

        exchangeData = data;
        return data;
    } catch (error) {
        console.log("error", error);
        showResult("Failed to load rates. Please check your internet connection.");
        return null;
    }
}

async function dropDowns() {
    const data = await getRates("USD");
    if (!data) return;

    const currencies = Object.keys(data.rates);
    selectFrom.innerHTML = "";
    selectTo.innerHTML = "";

    currencies.forEach((cur) => {
        selectFrom.innerHTML += `<option value="${cur}">${cur}</option>`;
        selectTo.innerHTML += `<option value="${cur}">${cur}</option>`;
    });

    selectFrom.value = "USD";
    selectTo.value = "PKR";
}

async function calculateCurrency() {
    const amount = parseFloat(amountInput.value);
    const from = selectFrom.value;
    const to = selectTo.value;

    if (isNaN(amount) || amount <= 0) {
        showResult("Please enter a valid amount");
        return;
    }

    convertBtn.classList.add("loading");
    convertBtn.disabled = true;
    convertBtn.innerText = "Converting...";

    try {
        if (!exchangeData || exchangeData.base_code !== from) {
            exchangeData = await getRates(from);
        }

        if (!exchangeData) return;

        const rate = exchangeData.rates[to];
        const conversion = (rate * amount).toFixed(2);
        showResult(`${amount} ${from} = ${conversion} ${to}`);
    } finally {
        convertBtn.classList.remove("loading");
        convertBtn.disabled = false;
        convertBtn.innerText = "Convert";
    }
}

convertBtn.addEventListener("click", calculateCurrency);
amountInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        calculateCurrency();
    }
});

resultBox.addEventListener("animationend", () => {
    resultBox.classList.remove("updated");
});

dropDowns();
