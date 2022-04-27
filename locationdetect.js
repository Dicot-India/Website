const $basic_p = document.querySelector(`#basic-price`);
const $plus_p = document.querySelector(`#plus-price`);
const $pro_p = document.querySelector(`#pro-price`);


const getVisitorCountry = () => {
  return new Promise((resolve, reject) => {
    window
      .fetch("https://ip2c.org/self")
      .then((response) => response.text())
      .then((data) => {
        const [status, country] = String(data).split(";");
        if (status !== "1") {
          throw new Error("Unable to fetch country");
        }
        resolve(country);
      })
      .catch(() => {
        resolve("US");
      });
  });
};

getVisitorCountry().then((country) => {
  if (["IN"].indexOf(country) !== -1) {
    $basic_p.textContent = "₹3,999";
    $plus_p.textContent = "₹9,499";
    $pro_p.textContent = "₹18,499";
  } else {
    $basic_p.textContent = "$54.99";
    $plus_p.textContent = "$129.99";
    $pro_p.textContent = "$249.99";
  }
});
