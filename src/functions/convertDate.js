export function convertDate(date) {
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octrobre", "Novembre", "Décembre"];
    const day = days[date.getDay()]
    const month = months[date.getMonth()]
    const result = {
                        dayweek: day, 
                        daymonth : date.getDate(), 
                        month: month, 
                        year: date.getFullYear()
                    }
    return (result)
};
