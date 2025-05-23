function GetDateFormatted(dataArr, format){
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Měsíce jsou indexované od 0
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}
module.exports = GetDateFormatted;