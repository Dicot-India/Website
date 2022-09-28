const $basic_p = document.querySelector(`#basic-price`);
const $plus_p = document.querySelector(`#plus-price`);
const $pre_m = document.querySelector(`#prem-price`);
const $pre_a = document.querySelector(`#prea-price`);
const $post_p = document.querySelector(`#post-price`);
const $user_p = document.querySelector(`#user-price`);


const getVisitorCountry = () => {
  return new Promise((resolve, reject) => {
    window
      .fetch("https://ip2c.org/?self")
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
    $pre_m.textContent = "₹2,149";
    $pre_a.textContent = "₹1,999";
    $post_p.textContent = "₹0.07";
    $user_p.textContent = "₹99";
  } else {
    $basic_p.textContent = "$54.99";
    $plus_p.textContent = "$129.99";
    $pro_p.textContent = "$249.99";
    $pre_m.textContent = "$29.99";
    $pre_a.textContent = "$26.99";
    $post_p.textContent = "$0.001";
    $user_p.textContent = "$1.69";
  }
});
