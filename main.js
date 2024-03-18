let currentPage = 1;
let rowsPerPage = 5;
let totalRows = 0;
let storedValues = {};


window.addEventListener('DOMContentLoaded', () => {
    const table = document.getElementById('responsiveTable');
    createTable(table, 1);
    document.getElementById('filterBtn').addEventListener('click', filterTable);
    document.getElementById('deleteBtn').addEventListener('click', deleteSelectedRows);
    document.getElementById('editBtn').addEventListener('click', () => openEditModal());
    document.getElementById('addBtn').addEventListener('click', openAddModal);
    document.getElementById('importBtn').addEventListener('click', openImportModal);
    document.getElementById('exportBtn').addEventListener('click', openExportModal);

    document.getElementById('rowsPerPageSelect').addEventListener('change', function() {
        rowsPerPage = parseInt(this.value);
        const totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = currentPage > totalPages ? totalPages : currentPage;
        createTable(document.getElementById('responsiveTable'), currentPage);
    });
    
    updateRowsDisplayText();

});

function createTable(table, page) {
    table.innerHTML = '';

    const headers = ['HEAD#1', 'HEAD#2', 'HEAD#3', 'HEAD#4'];
    let thead = table.createTHead();
    let headerRow = thead.insertRow();
    let selectCell = document.createElement('th');
    headerRow.appendChild(selectCell);
    let selectAllCheckbox = document.createElement('input');
    selectAllCheckbox.type = 'checkbox';
    selectAllCheckbox.classList.add('select-all');
    selectAllCheckbox.addEventListener('change', selectAllRows);
    selectCell.appendChild(selectAllCheckbox);
    headers.forEach(header => {
        let th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    if (totalRows === 0) {
        return;
    }


    let startingRow = (page - 1) * rowsPerPage;
    let endingRow = startingRow + rowsPerPage;
    for (let i = startingRow; i < endingRow && i < totalRows; i++) {
        let row = table.insertRow();
        let checkCell = row.insertCell();
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('checkmark');
        checkbox.addEventListener('change', updateEditButtonState);
        checkCell.appendChild(checkbox);
        headers.forEach((_, columnIndex) => {
            let cell = row.insertCell();
            let key = `row-${i}-column-${columnIndex + 1}`;
            cell.textContent = window.storedValues[key] || '';
        });
    }
    createPaginationControls(table);
}



function createPaginationControls(table) {
    let existingControls = document.querySelector('.pagination-controls');
    if (existingControls) {
        existingControls.remove();
    }

    let paginationControls = document.createElement('div');
    paginationControls.className = 'pagination-controls';

    let totalPages = Math.ceil(totalRows / rowsPerPage);
    let buttonsToShow = 5;
    let startPage, endPage;
    let hasEllipsis = true;

    if (totalPages <= 7) {

        startPage = 1;
        endPage = totalPages;
        hasEllipsis = false;
    } else {
        if (currentPage <= 4) {
            startPage = 1;
            endPage = buttonsToShow;
        } else if (currentPage + 3 >= totalPages) {
            startPage = totalPages - 6;
            endPage = totalPages;
            hasEllipsis = false;
        } else {
            startPage = currentPage - 2;
            endPage = currentPage + 2;
        }
    }

    appendButton(paginationControls, '<', currentPage > 1, currentPage - 1);

    for (let i = startPage; i <= endPage; i++) {
        appendButton(paginationControls, i, true, i);
    }

    if (hasEllipsis && totalPages > 7) {
        appendEllipsis(paginationControls);
        appendButton(paginationControls, totalPages - 1, true, totalPages - 1);
        appendButton(paginationControls, totalPages, true, totalPages);
    }

    appendButton(paginationControls, '>', currentPage < totalPages, currentPage + 1);

    table.parentElement.appendChild(paginationControls);
    updateRowsDisplayText();

}

function updateRowsDisplayText() {
    let rowsDisplayText = `Show ${((currentPage - 1) * rowsPerPage) + 1}-${Math.min(currentPage * rowsPerPage, totalRows)} of ${totalRows}`;
    document.getElementById('rowsDisplay').textContent = rowsDisplayText;
}

function appendButton(container, text, isEnabled, pageNumber) {
    let button = document.createElement('button');
    button.textContent = text;
    button.disabled = !isEnabled;
    button.addEventListener('click', function() {
        currentPage = pageNumber;
        createTable(document.getElementById('responsiveTable'), currentPage);
    });
    if (pageNumber === currentPage) {
        button.classList.add('active');
    }
    container.appendChild(button);
}

function appendEllipsis(container) {
    let ellipsis = document.createElement('span');
    ellipsis.textContent = '...';
    container.appendChild(ellipsis);
}

function filterTable() {
    let input = document.getElementById('searchBox');
    let filter = input.value.toUpperCase();
    let table = document.getElementById('responsiveTable');
    let tr = table.getElementsByTagName('tr');
    for (let i = 1; i < tr.length; i++) {
        tr[i].style.display = "none";
        let tdArray = tr[i].getElementsByTagName("td");
        for (let j = 1; j < tdArray.length; j++) {
            let td = tdArray[j];
            if (td && td.textContent.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
                break;
            }
        }
    }
}


function deleteSelectedRows() {
    const checkboxes = document.querySelectorAll('.checkmark:checked');
    const totalSelectedRows = checkboxes.length;

    if (totalRows <= 1 || totalSelectedRows === 0) {
        return;
    }

    const rowsToDelete = totalSelectedRows > 1 ? totalSelectedRows - 1 : (totalRows > 1 ? 1 : 0);

    checkboxes.forEach((checkbox, index) => {
        if (index < rowsToDelete) {
            const row = checkbox.closest('tr');
            const rowIndex = row.rowIndex - 1;

            for (let columnIndex = 1; columnIndex <= 4; columnIndex++) {
                delete window.storedValues[`row-${rowIndex}-column-${columnIndex}`];
            }

            for (let i = rowIndex + 1; i < totalRows; i++) {
                for (let j = 1; j <= 4; j++) {
                    window.storedValues[`row-${i-1}-column-${j}`] = window.storedValues[`row-${i}-column-${j}`];
                    delete window.storedValues[`row-${i}-column-${j}`];
                }
            }

            totalRows--;
            checkbox.closest('tr').remove();
        }
    });

    const totalPages = Math.ceil(totalRows / rowsPerPage);
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    createTable(document.getElementById('responsiveTable'), currentPage);
    updatePaginationAndTable();
}



function selectAllRows() {
    let checked = document.querySelector('.select-all').checked;
    document.querySelectorAll('.checkmark').forEach(checkbox => {
        checkbox.checked = checked;
    });
    updateEditButtonState();
}

function updateEditButtonState() {
    let selectedRows = document.querySelectorAll('.checkmark:checked').length;
    document.getElementById('editBtn').disabled = selectedRows !== 1;
}

function openEditModal() {
    document.getElementById('editModal').style.display = 'block';
    let selectedRow = document.querySelector('.checkmark:checked').closest('tr');
    document.getElementById('editField1').value = selectedRow.cells[1].textContent;
    document.getElementById('editField2').value = selectedRow.cells[2].textContent;
    document.getElementById('editField3').value = selectedRow.cells[3].textContent;
    document.getElementById('editField4').value = selectedRow.cells[4].textContent;
    document.getElementById('editModal').style.display = 'block';

    document.getElementById('saveEdit').onclick = function() { saveEdits(selectedRow);};
}

function openAddModal() {
    fillModalWithRowData();
    document.getElementById('saveEdit').onclick = function() { addNewRow(); };
    document.getElementById('editModal').style.display = 'block';
}

function fillModalWithRowData(row = null) {
    if (row) {
        document.getElementById('editField1').value = row.cells[1].textContent;
        document.getElementById('editField2').value = row.cells[2].textContent;
        document.getElementById('editField3').value = row.cells[3].textContent;
        document.getElementById('editField4').value = row.cells[4].textContent;
    } else {
        document.getElementById('editField1').value = '';
        document.getElementById('editField2').value = '';
        document.getElementById('editField3').value = '';
        document.getElementById('editField4').value = '';
    }
}

function addNewRow() {
    const table = document.getElementById('responsiveTable');
    const newRow = table.insertRow();
    const newCellCheck = newRow.insertCell(0);
    const newCheckbox = document.createElement('input');
    newCheckbox.type = 'checkbox';
    newCheckbox.classList.add('checkmark');
    newCheckbox.addEventListener('change', updateEditButtonState);
    newCellCheck.appendChild(newCheckbox);
    totalRows++;
    
    const newRowNumber = totalRows - 1;
    if (!window.storedValues) {
        window.storedValues = {};
    }

    for (let i = 1; i <= 4; i++) {
        let cell = newRow.insertCell(i);
        let value = document.getElementById(`editField${i}`).value;
        cell.textContent = value;

        let key = `row-${newRowNumber}-column-${i}`;
        window.storedValues[key] = value;
    }

    document.getElementById('editModal').style.display = 'none';
    updatePaginationAndTable();
}


function saveEdits(row) {
    const rowIndex = row.rowIndex - 1;

    row.cells[1].textContent = document.getElementById('editField1').value;
    row.cells[2].textContent = document.getElementById('editField2').value;
    row.cells[3].textContent = document.getElementById('editField3').value;
    row.cells[4].textContent = document.getElementById('editField4').value;


    window.storedValues[`row-${rowIndex}-column-1`] = document.getElementById('editField1').value;
    window.storedValues[`row-${rowIndex}-column-2`] = document.getElementById('editField2').value;
    window.storedValues[`row-${rowIndex}-column-3`] = document.getElementById('editField3').value;
    window.storedValues[`row-${rowIndex}-column-4`] = document.getElementById('editField4').value;

    document.getElementById('editModal').style.display = 'none';
}


document.addEventListener('DOMContentLoaded', function() {
    const table = document.getElementById('responsiveTable');
    createTable(table, 1);

    document.getElementById('editBtn').addEventListener('click', function() {
        let selectedRow = document.querySelector('.checkmark:checked').closest('tr');
        document.getElementById('editField1').value = selectedRow.cells[1].textContent;
        document.getElementById('editField2').value = selectedRow.cells[2].textContent;
        document.getElementById('editField3').value = selectedRow.cells[3].textContent;
        document.getElementById('editField4').value = selectedRow.cells[4].textContent;
        document.getElementById('editModal').style.display = 'block';
    });

    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('editModal').style.display = 'none';
    });

    document.getElementById('saveEdit').addEventListener('click', function() {
        let selectedRow = document.querySelector('.checkmark:checked').closest('tr');
        selectedRow.cells[1].textContent = document.getElementById('editField1').value;
        selectedRow.cells[2].textContent = document.getElementById('editField2').value;
        selectedRow.cells[3].textContent = document.getElementById('editField3').value;
        selectedRow.cells[4].textContent = document.getElementById('editField4').value;
        document.getElementById('editModal').style.display = 'none';
    });
});

function openImportModal() {
    document.getElementById('importModal').style.display = 'block';
}

function importData() {
    document.getElementById('importModal').style.display = 'none';
    const importInput = document.getElementById('importDataField');
    const dataToImport = JSON.parse(importInput.value);
    dataToImport.forEach(entry => {
        addRowWithData(entry);
    });
    updatePaginationAndTable();
}

function addRowWithData(data) {
    const table = document.getElementById('responsiveTable');
    const newRow = table.insertRow();
    const newCellCheck = newRow.insertCell(0);
    const newCheckbox = document.createElement('input');
    newCheckbox.type = 'checkbox';
    newCheckbox.classList.add('checkmark');
    newCheckbox.addEventListener('change', updateEditButtonState);
    newCellCheck.appendChild(newCheckbox);
    totalRows++;
    
    if (!window.storedValues) {
        window.storedValues = {};
    }

    const newRowNumber = totalRows - 1;

    Object.values(data).forEach((text, index) => {
        let cell = newRow.insertCell(index + 1);
        cell.textContent = text;

        let key = `row-${newRowNumber}-column-${index + 1}`;
        window.storedValues[key] = text;
    });

}


function openExportModal() {
    const dataToExport = collectAllTableData();
    document.getElementById('exportDataField').value = JSON.stringify(dataToExport, null, 2);
    document.getElementById('exportModal').style.display = 'block';
}

function collectAllTableData() {
    const dataToExport = [];
    const totalRows = Object.keys(window.storedValues).reduce((acc, key) => {
        const rowNumber = parseInt(key.split('-')[1]);
        return Math.max(acc, rowNumber);
    }, 0);

    for (let i = 0; i <= totalRows; i++) {
        const rowData = {};
        for (let j = 1; j <= 4; j++) {
            const key = `row-${i}-column-${j}`;
            if (window.storedValues[key] !== undefined) {
                rowData[`HEAD#${j}`] = window.storedValues[key];
            }
        }
        if (Object.keys(rowData).length > 0) {
            dataToExport.push(rowData);
        }
    }

    return dataToExport;
}

function downloadExportedData() {
    document.getElementById('exportModal').style.display = 'none';
    const data = document.getElementById('exportDataField').value;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function updatePaginationAndTable() {
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    createTable(document.getElementById('responsiveTable'), currentPage);
}

function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    modal.style.display = "none";
}