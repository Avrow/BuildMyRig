'use client';

import { useState, useEffect } from 'react';

export default function QuoteGenerator() {
    const [parts, setParts] = useState([
        // CPUs
        { id: 1, name: "Intel Core i5-12400F", category: "CPU", price: 12500, brand: "Intel", specs: "6 Cores, 12 Threads, 4.4GHz" },
        { id: 2, name: "Intel Core i5-13600K", category: "CPU", price: 18500, brand: "Intel", specs: "14 Cores, 20 Threads, 5.1GHz" },
        { id: 3, name: "AMD Ryzen 5 5600X", category: "CPU", price: 13500, brand: "AMD", specs: "6 Cores, 12 Threads, 4.6GHz" },
        { id: 4, name: "AMD Ryzen 7 5800X", category: "CPU", price: 22000, brand: "AMD", specs: "8 Cores, 16 Threads, 4.7GHz" },
        
        // GPUs
        { id: 5, name: "NVIDIA RTX 3060 12GB", category: "GPU", price: 35000, brand: "NVIDIA", specs: "3584 CUDA Cores, 12GB GDDR6" },
        { id: 6, name: "NVIDIA RTX 4060 8GB", category: "GPU", price: 45000, brand: "NVIDIA", specs: "3072 CUDA Cores, 8GB GDDR6" },
        { id: 7, name: "AMD RX 6600 8GB", category: "GPU", price: 28000, brand: "AMD", specs: "1792 Stream Processors, 8GB GDDR6" },
        { id: 8, name: "AMD RX 7600 8GB", category: "GPU", price: 32000, brand: "AMD", specs: "2048 Stream Processors, 8GB GDDR6" },
        
        // RAM
        { id: 9, name: "Corsair Vengeance 8GB DDR4", category: "RAM", price: 3500, brand: "Corsair", specs: "8GB, 3200MHz, CL16" },
        { id: 10, name: "G.Skill Ripjaws 16GB DDR4", category: "RAM", price: 7200, brand: "G.Skill", specs: "16GB (2x8GB), 3200MHz, CL16" },
        { id: 11, name: "Corsair Vengeance 32GB DDR4", category: "RAM", price: 14000, brand: "Corsair", specs: "32GB (2x16GB), 3200MHz, CL16" },
        
        // Storage
        { id: 12, name: "Samsung 970 EVO 500GB", category: "Storage", price: 4500, brand: "Samsung", specs: "500GB NVMe M.2, 3500MB/s" },
        { id: 13, name: "WD Blue SN570 1TB", category: "Storage", price: 6500, brand: "Western Digital", specs: "1TB NVMe M.2, 3500MB/s" },
        { id: 14, name: "Crucial MX500 1TB", category: "Storage", price: 8500, brand: "Crucial", specs: "1TB SATA SSD, 560MB/s" },
        { id: 15, name: "Seagate Barracuda 2TB", category: "Storage", price: 5500, brand: "Seagate", specs: "2TB HDD, 7200RPM" },
        
        // Motherboards
        { id: 16, name: "ASUS Prime B560M-A", category: "Motherboard", price: 8500, brand: "ASUS", specs: "Micro-ATX, LGA 1200, DDR4" },
        { id: 17, name: "MSI B560M PRO-VDH", category: "Motherboard", price: 9200, brand: "MSI", specs: "Micro-ATX, LGA 1200, DDR4" },
        { id: 18, name: "Gigabyte B550 AORUS ELITE", category: "Motherboard", price: 11000, brand: "Gigabyte", specs: "ATX, AM4, DDR4" },
        
        // Power Supply
        { id: 19, name: "Corsair CV550 550W", category: "PSU", price: 4500, brand: "Corsair", specs: "550W 80+ Bronze" },
        { id: 20, name: "Seasonic Focus GX-650", category: "PSU", price: 7500, brand: "Seasonic", specs: "650W 80+ Gold" },
        { id: 21, name: "EVGA SuperNOVA 750W", category: "PSU", price: 8500, brand: "EVGA", specs: "750W 80+ Gold" },
        
        // Case
        { id: 22, name: "NZXT H510", category: "Case", price: 6500, brand: "NZXT", specs: "Mid Tower, ATX, Tempered Glass" },
        { id: 23, name: "Fractal Design Core 1000", category: "Case", price: 3500, brand: "Fractal Design", specs: "Micro-ATX Tower" },
        { id: 24, name: "Cooler Master MasterBox Q300L", category: "Case", price: 2800, brand: "Cooler Master", specs: "Micro-ATX, Side Panel Window" },
        
        // Cooling
        { id: 25, name: "Cooler Master Hyper 212", category: "Cooling", price: 2500, brand: "Cooler Master", specs: "Air Cooler, 4 Heat Pipes" },
        { id: 26, name: "be quiet! Pure Rock Slim", category: "Cooling", price: 2200, brand: "be quiet!", specs: "92mm CPU Cooler" },
        { id: 27, name: "Noctua NH-D15", category: "Cooling", price: 12000, brand: "Noctua", specs: "Dual Tower Air Cooler, 140mm" },
    ]);
    
    const [selectedParts, setSelectedParts] = useState([]);
    const [quoteName, setQuoteName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [savedQuotes, setSavedQuotes] = useState([]);
    const [serverStatus, setServerStatus] = useState('unknown');

    const categories = ['CPU', 'GPU', 'RAM', 'Storage', 'Motherboard', 'PSU', 'Case', 'Cooling'];

    // Test server connection
    useEffect(() => {
        const testServer = async () => {
            try {
                const response = await fetch('http://localhost:9479/api/quotes/test');
                if (response.ok) {
                    setServerStatus('connected');
                    console.log('Server is connected');
                } else {
                    setServerStatus('error');
                    console.log('Server responded with error');
                }
            } catch (err) {
                setServerStatus('disconnected');
                console.log('Server is not responding:', err.message);
            }
        };
        testServer();
    }, []);

    const togglePart = (part) => {
        setSelectedParts(prev => {
            const isSelected = prev.some(p => p.id === part.id);
            if (isSelected) {
                setMessage(`Removed: ${part.name}`);
                return prev.filter(p => p.id !== part.id);
            } else {
                setMessage(`Added: ${part.name}`);
                return [...prev, part];
            }
        });
    };

    const calculateTotal = () => {
        return selectedParts.reduce((sum, part) => sum + part.price, 0);
    };

    const saveQuote = async () => {
        if (!quoteName.trim()) {
            setMessage('Please enter a quote name');
            return;
        }

        if (selectedParts.length === 0) {
            setMessage('Please select at least one part');
            return;
        }

        setLoading(true);
        try {
            console.log('Saving quote:', { quoteName, partsCount: selectedParts.length });
            
            const response = await fetch('http://localhost:9479/api/quotes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: 'offline-shopper',
                    quoteName: quoteName.trim(),
                    parts: selectedParts
                })
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.success) {
                setMessage('Quote saved successfully! Ready for offline shopping.');
                setQuoteName('');
                setSelectedParts([]);
            } else {
                setMessage(data.message || 'Failed to save quote');
            }
        } catch (err) {
            console.error('Save quote error:', err);
            setMessage(`Failed to save quote: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const printShoppingList = () => {
        const printWindow = window.open('', '_blank');
        const shoppingListHTML = `
            <html>
                <head>
                    <title>PC Shopping List - ${quoteName || 'Untitled'}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
                        .category { margin: 20px 0; }
                        .category h2 { color: #007bff; margin-bottom: 10px; }
                        .part { border: 1px solid #ddd; padding: 10px; margin: 5px 0; background: #f9f9f9; }
                        .part-name { font-weight: bold; font-size: 16px; }
                        .part-specs { color: #666; font-size: 14px; margin: 5px 0; }
                        .part-price { color: #28a745; font-weight: bold; font-size: 18px; }
                        .total { border-top: 2px solid #333; margin-top: 20px; padding-top: 10px; font-size: 20px; font-weight: bold; }
                        .notes { margin-top: 20px; padding: 10px; background: #fff3cd; border: 1px solid #ffeaa7; }
                    </style>
                </head>
                <body>
                    <h1>PC Building Shopping List</h1>
                    <p><strong>Quote Name:</strong> ${quoteName || 'Untitled'}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Total Items:</strong> ${selectedParts.length}</p>
                    
                    ${categories.map(category => {
                        const categoryParts = selectedParts.filter(part => part.category === category);
                        if (categoryParts.length === 0) return '';
                        return `
                            <div class="category">
                                <h2>${category}</h2>
                                ${categoryParts.map(part => `
                                    <div class="part">
                                        <div class="part-name">${part.name}</div>
                                        <div class="part-specs">${part.specs}</div>
                                        <div class="part-specs">Brand: ${part.brand}</div>
                                        <div class="part-price">Price:  TK ${part.price.toLocaleString()}</div>
                                    </div>
                                `).join('')}
                            </div>
                        `;
                    }).join('')}
                    
                    <div class="total">
                        Total Cost: TK ${calculateTotal().toLocaleString()}
                    </div>
                    
                    <div class="notes">
                        <strong>Shopping Notes:</strong><br>
                        - Print this list and take it to computer shops<br>
                        - Compare prices at multiple stores<br>
                        - Check for warranty and return policies<br>
                        - Ask about bundle discounts<br>
                        - Verify compatibility before purchasing
                    </div>
                </body>
            </html>
        `;
        
        printWindow.document.write(shoppingListHTML);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div style={{padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh'}}>
            <div style={{backgroundColor: '#007bff', color: 'white', padding: '15px', marginBottom: '20px', borderRadius: '8px'}}>
                <h1 style={{margin: 0, fontSize: '24px'}}>PC Shopping List Generator</h1>
                <p style={{margin: '5px 0 0 0', fontSize: '14px'}}>Create organized shopping lists for offline PC component purchases</p>
                <div style={{marginTop: '10px', fontSize: '12px'}}>
                    Server Status: 
                    <span style={{
                        backgroundColor: serverStatus === 'connected' ? '#28a745' : serverStatus === 'disconnected' ? '#dc3545' : '#ffc107',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        marginLeft: '5px'
                    }}>
                        {serverStatus === 'connected' ? 'Connected' : serverStatus === 'disconnected' ? 'Disconnected' : 'Checking...'}
                    </span>
                </div>
            </div>
            
            {message && (
                <div style={{backgroundColor: message.includes('success') ? '#d4edda' : '#f8d7da', padding: '10px', marginBottom: '20px', borderRadius: '5px', color: message.includes('success') ? '#155724' : '#721c24'}}>
                    {message}
                </div>
            )}

            <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
                {/* Parts Selection */}
                <div style={{flex: 2}}>
                    <h2 style={{fontSize: '20px', marginBottom: '15px', color: '#333'}}>Available Components</h2>
                    
                    {categories.map(category => (
                        <div key={category} style={{marginBottom: '25px'}}>
                            <h3 style={{fontSize: '18px', marginBottom: '10px', color: '#007bff', borderBottom: '1px solid #ddd', paddingBottom: '5px'}}>
                                {category} ({parts.filter(p => p.category === category).length} items)
                            </h3>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px'}}>
                                {parts
                                    .filter(part => part.category === category)
                                    .map(part => (
                                        <div 
                                            key={part.id} 
                                            onClick={() => togglePart(part)}
                                            style={{
                                                border: selectedParts.some(p => p.id === part.id) ? '2px solid #007bff' : '1px solid #ddd',
                                                borderRadius: '8px',
                                                padding: '12px',
                                                cursor: 'pointer',
                                                backgroundColor: selectedParts.some(p => p.id === part.id) ? '#e3f2fd' : 'white',
                                                transition: 'all 0.2s',
                                                boxShadow: selectedParts.some(p => p.id === part.id) ? '0 2px 8px rgba(0,123,255,0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            <div style={{fontWeight: 'bold', fontSize: '16px', marginBottom: '5px'}}>{part.name}</div>
                                            <div style={{color: '#666', fontSize: '12px', marginBottom: '5px'}}>{part.specs}</div>
                                            <div style={{color: '#999', fontSize: '11px', marginBottom: '8px'}}>Brand: {part.brand}</div>
                                            <div style={{color: '#007bff', fontSize: '18px', fontWeight: 'bold'}}>TK {part.price.toLocaleString()}</div>
                                            {selectedParts.some(p => p.id === part.id) && (
                                                <div style={{color: '#28a745', fontSize: '12px', fontWeight: 'bold', marginTop: '8px'}}>+ SELECTED</div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Shopping List */}
                <div style={{flex: 1, minWidth: '350px'}}>
                    <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
                        <h2 style={{fontSize: '20px', marginBottom: '15px', color: '#333'}}>Your Shopping List</h2>
                        
                        <div style={{marginBottom: '15px'}}>
                            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333'}}>
                                List Name:
                            </label>
                            <input
                                type="text"
                                value={quoteName}
                                onChange={(e) => setQuoteName(e.target.value)}
                                placeholder="e.g., Gaming PC Build, Office Setup"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <div style={{marginBottom: '15px'}}>
                            <h3 style={{marginBottom: '10px', color: '#333'}}>Selected Items ({selectedParts.length})</h3>
                            {selectedParts.length === 0 ? (
                                <p style={{color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px'}}>No items selected</p>
                            ) : (
                                <div style={{maxHeight: '250px', overflowY: 'auto'}}>
                                    {categories.map(category => {
                                        const categoryParts = selectedParts.filter(part => part.category === category);
                                        if (categoryParts.length === 0) return null;
                                        return (
                                            <div key={category} style={{marginBottom: '15px'}}>
                                                <div style={{fontWeight: 'bold', color: '#007bff', marginBottom: '5px', fontSize: '12px', textTransform: 'uppercase'}}>{category}</div>
                                                {categoryParts.map(part => (
                                                    <div key={part.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: '#f8f9fa', marginBottom: '3px', borderRadius: '4px'}}>
                                                        <span style={{fontSize: '13px'}}>{part.name}</span>
                                                        <span style={{color: '#28a745', fontWeight: 'bold', fontSize: '14px'}}>TK {part.price.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div style={{borderTop: '2px solid #ddd', paddingTop: '15px', marginBottom: '15px'}}>
                            <div style={{fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '10px', textAlign: 'center'}}>
                                Total: TK {calculateTotal().toLocaleString()}
                            </div>
                            
                            {selectedParts.length > 0 && (
                                <button
                                    onClick={printShoppingList}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        marginBottom: '10px'
                                    }}
                                >
                                    Print Shopping List
                                </button>
                            )}
                            
                            <button
                                onClick={saveQuote}
                                disabled={loading || !quoteName.trim() || selectedParts.length === 0}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: loading ? '#6c757d' : '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: (loading || !quoteName.trim() || selectedParts.length === 0) ? 0.6 : 1
                                }}
                            >
                                {loading ? 'Saving...' : 'Save Shopping List'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
