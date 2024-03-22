// Permissions
const tablePermissions = document.querySelector("[table-permissions]");
if(tablePermissions) {
    let permissions = [];

    const buttonSubmit = document.querySelector("[button-submit]");

    buttonSubmit.addEventListener("click", () => {
        const rows = tablePermissions.querySelectorAll("[data-name]");

        rows.forEach(row => {
            const name = row.getAttribute("data-name");
            const inputs = row.querySelectorAll("input");

            if(name == "id") {
                inputs.forEach(input => {
                    const id = input.value;
                    permissions.push({
                        id: id,
                        permissions: []
                    });
                });
            } else {
                inputs.forEach((input, index) => {
                    const checked = input.checked;

                    // console.log(name);
                    // console.log(index)
                    // console.log(checked);
                    // console.log("---------");

                    if(checked) {
                        permissions[index].permissions.push(name);
                    }
                });
            }
        });

        // console.log(permissions);

        if(permissions.length > 0) {
            const formChangePermissions = document.querySelector("#form-change-permissions");
            const inputPermissions = formChangePermissions.querySelector("input[name='permissions']");
            
            // Chuyển 1 mảng thành 1 chuổi json
            inputPermissions.value = JSON.stringify(permissions); 

            formChangePermissions.submit();
        }
    });
}
// End Permissions

// Logic Permissions Data Default
const dateRecords = document.querySelector("[data-records]");
if(dateRecords) {
    const records = JSON.parse(dateRecords.getAttribute("data-records"));
    
    const tablePermissions = document.querySelector("[table-permissions]");

    records.forEach((record, index) => {
        const permissions = record.permissions;

        permissions.forEach(permission => {
            const row = tablePermissions.querySelector(`[data-name="${permission}"]`);
            const input = row.querySelectorAll("input")[index];
            
            input.checked = true;

                
            // console.log(permission);
            // console.log(index);
        });
    });
}
// End Logic Permissions Data Default

// Delete item
const buttonsDelete = document.querySelectorAll("[button-delete]");
if(buttonsDelete.length > 0) {
    const formDeleteItem = document.querySelector("#form-delete-item");
    const path = formDeleteItem.getAttribute("data-path");

    buttonsDelete.forEach(button => {
        button.addEventListener("click", () => {
            const isConfirm = confirm("Bạn có chắc chăns muốn xóa ?");

            if(isConfirm) {
                const id = button.getAttribute("data-id");
                const action = `${path}/${id}?_method=DELETE`;

                formDeleteItem.action = action;
                formDeleteItem.submit();
            }
        });
    });
}
// End Delete item