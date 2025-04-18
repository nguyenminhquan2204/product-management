// Show alert
const showAlert = document.querySelector("[show-alert]");
if(showAlert) {
    const time = parseInt(showAlert.getAttribute("data-time"));
    const closeAlert = showAlert.querySelector("[close-alert]");

    setTimeout(() => {
        showAlert.classList.add("alert-hidden");
    }, time);

    closeAlert.addEventListener("click", () => {
        showAlert.classList.add("alert-hidden");
    });
}
// End Show Alert

// Button Go Back
const buttonsGoBack = document.querySelectorAll("[button-go-back]");
if(buttonsGoBack.length > 0) {
    buttonsGoBack.forEach(button => {
        button.addEventListener("click", () => {
            history.back(); //trở lại trang trước

        });
    });
}
// Button Go Back

const buttonsPagination = document.querySelectorAll("[button-pagination]");
if(buttonsPagination) {
    let url = new URL(window.location.href);

    buttonsPagination.forEach(button => {
        button.addEventListener("click", () => {
            const page = button.getAttribute("button-pagination");
            // console.log(page);

            url.searchParams.set("page", page);
            window.location.href = url.href;
        });
    });
}