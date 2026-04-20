const getParts = (req, res) => {
    const dummyParts = [
        // CPUs
        { id: 1, name: "Intel Core i5-12400F", category: "CPU", price: 12500 },
        { id: 2, name: "Intel Core i5-13600K", category: "CPU", price: 18500 },
        { id: 3, name: "Intel Core i7-13700K", category: "CPU", price: 28500 },
        { id: 4, name: "AMD Ryzen 5 5600X", category: "CPU", price: 13500 },
        { id: 5, name: "AMD Ryzen 7 5800X", category: "CPU", price: 19500 },
        { id: 6, name: "AMD Ryzen 5 7600X", category: "CPU", price: 17500 },
        
        // GPUs
        { id: 7, name: "NVIDIA RTX 3060", category: "GPU", price: 35000 },
        { id: 8, name: "NVIDIA RTX 3060 Ti", category: "GPU", price: 42000 },
        { id: 9, name: "NVIDIA RTX 3070", category: "GPU", price: 55000 },
        { id: 10, name: "NVIDIA RTX 4060", category: "GPU", price: 45000 },
        { id: 11, name: "NVIDIA RTX 4060 Ti", category: "GPU", price: 52000 },
        { id: 12, name: "AMD RX 6600", category: "GPU", price: 28000 },
        { id: 13, name: "AMD RX 6700 XT", category: "GPU", price: 38000 },
        
        // RAM
        { id: 14, name: "Corsair Vengeance 8GB DDR4 3200MHz", category: "RAM", price: 3500 },
        { id: 15, name: "Corsair Vengeance 16GB DDR4 3200MHz", category: "RAM", price: 6500 },
        { id: 16, name: "G.Skill Ripjaws 16GB DDR4 3600MHz", category: "RAM", price: 7200 },
        { id: 17, name: "Corsair Vengeance 32GB DDR4 3200MHz", category: "RAM", price: 12000 },
        { id: 18, name: "G.Skill Ripjaws 16GB DDR5 5600MHz", category: "RAM", price: 9500 },
        
        // SSDs
        { id: 19, name: "Samsung 970 EVO 500GB NVMe", category: "SSD", price: 4500 },
        { id: 20, name: "Samsung 980 1TB NVMe", category: "SSD", price: 7500 },
        { id: 21, name: "Crucial MX500 1TB SATA", category: "SSD", price: 8500 },
        { id: 22, name: "WD Blue SN570 1TB NVMe", category: "SSD", price: 6500 },
        { id: 23, name: "Samsung 980 Pro 1TB NVMe", category: "SSD", price: 12000 },
        { id: 24, name: "Crucial P3 2TB NVMe", category: "SSD", price: 14000 },
        
        // Motherboards
        { id: 25, name: "ASUS Prime B560M-A", category: "Motherboard", price: 8500 },
        { id: 26, name: "MSI B560M PRO-VDH", category: "Motherboard", price: 9200 },
        { id: 27, name: "ASUS TUF Gaming B560-Plus", category: "Motherboard", price: 11500 },
        { id: 28, name: "MSI B550 Gaming Plus", category: "Motherboard", price: 12500 },
        { id: 29, name: "ASUS Prime B550M-A", category: "Motherboard", price: 9800 },
        { id: 30, name: "Gigabyte B550 AORUS Elite", category: "Motherboard", price: 13500 },
        { id: 31, name: "ASUS ROG Strix B550-F", category: "Motherboard", price: 15500 },
    ];

    res.status(200).json({
        success: true,
        data: dummyParts,
    });
};

export { getParts };
