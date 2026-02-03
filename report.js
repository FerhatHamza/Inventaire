// --- REPORT.JS ---
// Nécessite jsPDF et jsPDF-AutoTable chargés dans la page

const drawHeaderService = (doc, title, serviceName) => {
    doc.setTextColor(0,0,0);
    doc.setFont("helvetica", "bold").setFontSize(10);
    doc.text("République Algérienne Démocratique Et Populaire", 105, 15, {align:"center"});
    doc.text("Ministère de la Santé", 105, 20, {align:"center"});
    
    doc.setFont("helvetica", "normal").setFontSize(9);
    doc.text("Direction de la Santé et de la Population de la Wilaya de Ghardaïa", 20, 30);
    doc.text("Etablissement Public de santé de proximité - Berriane", 20, 35);
    
    doc.setFont("helvetica", "bold");
    doc.text("" + serviceName, 20, 40);
    
    doc.setDrawColor(0).setLineWidth(0.5).line(20, 43, 190, 43);
    doc.setFontSize(14).text(title, 105, 52, {align:"center"});
};

const drawHeaderAdmin = (doc, title) => {
    doc.setTextColor(0,0,0);
    doc.setFont("helvetica", "bold").setFontSize(10);
    doc.text("République Algérienne Démocratique Et Populaire", 105, 15, {align:"center"});
    doc.text("Ministère de la Santé", 105, 20, {align:"center"});
    
    doc.setFont("helvetica", "normal").setFontSize(9);
    doc.text("Direction de la Santé et de la Population de la Wilaya de Ghardaïa", 20, 30);
    doc.text("Etablissement Public de santé de proximité - Berriane", 20, 35);
    
    doc.setFont("helvetica", "bold");
    doc.text("Bureau des Systèmes d'Information et Informatique", 20, 40);
    
    doc.setDrawColor(0).setLineWidth(0.5).line(20, 43, 190, 43);
    doc.setFontSize(14).text(title, 105, 60, {align:"center"});
};

const drawFooterService = (doc) => {
    const footerY = 280; 
    doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(0,0,0);
    doc.text("Berriane le : " + new Date().toLocaleDateString('fr-FR'), 140, footerY);
    doc.setFont("helvetica", "bold").text("Le Chef de Service", 155, footerY + 7);
};

const drawFooterAdmin = (doc) => {
    const footerY = 280;
    doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(0,0,0);
    doc.text("Berriane le : " + new Date().toLocaleDateString('fr-FR'), 140, footerY);
    doc.setFont("helvetica", "bold").text("Bureau SII", 155, footerY + 7);
};

export const generatePDF = (items, userService, isGlobalAdmin) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Choix du Header
    const title = "ETAT DE RECENSEMENT DES IMMOBILISATIONS";
    if (isGlobalAdmin) {
        drawHeaderAdmin(doc, title);
    } else {
        drawHeaderService(doc, title, userService || "Service");
    }

    // Tableau Données
    const tableData = items.map(item => [
        item.observations || '',
        item.location,
        item.condition,
        item.designation,
        item.inv_number
    ]);

    doc.autoTable({
        head: [['Observations', 'Localisation', 'Etat', 'Désignation', 'N° Inventaire']],
        body: tableData,
        startY: 70,
        styles: { halign: 'right', font: 'helvetica' }, // Attention: Helvetica ne supporte pas l'Arabe
        headStyles: { fillColor: [2, 132, 199], halign: 'center' },
        theme: 'grid'
    });

    // Footer
    if (isGlobalAdmin) {
        drawFooterAdmin(doc);
    } else {
        drawFooterService(doc);
    }

    doc.save("Inventaire_EPSP.pdf");
};
