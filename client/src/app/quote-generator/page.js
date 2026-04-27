'use client';

import { useState, useEffect } from 'react';

export default function QuoteGenerator() {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedParts, setSelectedParts] = useState([]);
    const [quoteName, setQuoteName] = useState('');
    const [saveLoading, setSaveLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [savedQuotes, setSavedQuotes] = useState([]);
    const [serverStatus, setServerStatus] = useState('unknown');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCategory, setFilteredCategory] = useState('');
    const [pdfLoading, setPdfLoading] = useState(false);

    const categories = ['CPU', 'GPU', 'RAM', 'Storage', 'Motherboard', 'PSU', 'Case', 'Cooler'];
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const fetchExchangeRate = async () => {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            const bdtRate = data.rates.BDT;
            return bdtRate;
        } catch (error) {
            return null;
        }
    };

    
    // Fetch components from API
    useEffect(() => {
        const fetchAllComponents = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch all types with high limit to get comprehensive dataset
                const allComponents = [];
                
                for (const type of categories) {
                    const params = new URLSearchParams({
                        type,
                        limit: 500 // Get more items per type to avoid the 100 limit
                    });
                    
                    console.log(`Fetching ${type} components with params: ${params.toString()}`);
                    
                    try {
                        const response = await fetch(`${API_URL}/api/components?${params.toString()}`, {
                            credentials: "include"
                        });
                        
                        if (!response.ok) {
                            console.error(`Failed to fetch ${type} components: HTTP ${response.status}`);
                            continue; // Skip this type and continue with others
                        }
                        
                        const data = await response.json();
                        console.log(`${type} API response:`, data);
                    
                    // Use exact same response handling as component feature
                    const componentsToAdd = data.components ?? [];
                    console.log(`Adding ${componentsToAdd.length} ${type} components`);
                    allComponents.push(...componentsToAdd);
                    } catch (err) {
                        console.error(`Failed to fetch ${type} components:`, err);
                        // Continue with next type instead of failing completely
                    }
                }
                
                // Debug: Show component counts by type
                const componentCounts = {};
                categories.forEach(cat => {
                    componentCounts[cat] = allComponents.filter(p => p.type?.toLowerCase() === cat.toLowerCase()).length;
                });
                console.log('Component counts by API type:', componentCounts);
                
                setParts(allComponents);
                console.log(`Loaded ${allComponents.length} components from API`);
            } catch (err) {
                console.error('Failed to fetch components:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchAllComponents();
    }, [API_URL]);

    // Test server connection and API structure
    useEffect(() => {
        const testServer = async () => {
            try {
                console.log('Testing API connection to:', API_URL);
                
                // Test 1: Basic connectivity
                const basicResponse = await fetch(`${API_URL}/api/components?limit=1`, {
                    credentials: "include"
                });
                console.log('Basic response status:', basicResponse.status);
                
                if (basicResponse.ok) {
                    const basicData = await basicResponse.json();
                    console.log('Basic API response structure:', basicData);
                    
                    // Test 2: Test each component type
                    for (const type of ['CPU', 'GPU']) {
                        const typeResponse = await fetch(`${API_URL}/api/components?type=${type}&limit=2`, {
                            credentials: "include"
                        });
                        console.log(`${type} type response status:`, typeResponse.status);
                        
                        if (typeResponse.ok) {
                            const typeData = await typeResponse.json();
                            console.log(`${type} type response:`, typeData);
                        }
                    }
                    
                    setServerStatus('connected');
                    console.log('Components API is connected and working');
                } else {
                    setServerStatus('error');
                    console.log('Components API responded with error:', basicResponse.status);
                }
            } catch (err) {
                setServerStatus('disconnected');
                console.log('Components API is not responding:', err.message);
            }
        };
        testServer();
    }, [API_URL]);

    const togglePart = (part) => {
        setSelectedParts(prev => {
            const isSelected = prev.some(p => p._id === part._id);
            if (isSelected) {
                setMessage(`Removed: ${part.name}`);
                return prev.filter(p => p._id !== part._id);
            } else {
                setMessage(`Added: ${part.name}`);
                return [...prev, part];
            }
        });
    };

    const calculateTotal = () => {
        return selectedParts.reduce((sum, part) => sum + (part.price || 0), 0);
    };

    const saveQuote = async () => {
        console.log('saveQuote called!', { quoteName, selectedPartsLength: selectedParts.length, saveLoading });
        
        if (!quoteName.trim()) {
            console.log('No quote name provided');
            setMessage('Please enter a quote name');
            return;
        }

        if (selectedParts.length === 0) {
            console.log('No parts selected');
            setMessage('Please select at least one part');
            return;
        }

        console.log('Starting save process...');
        setSaveLoading(true);
        try {
            console.log('Saving quote:', { quoteName, partsCount: selectedParts.length });
            
            const response = await fetch(`${API_URL}/api/quotes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "include",
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
            setSaveLoading(false);
        }
    };

    // Handle search functionality
    const handleSearch = (term) => {
        const upperTerm = term.toUpperCase().trim();
        console.log('Search term:', term, 'Upper term:', upperTerm);
        console.log('Categories:', categories);
        console.log('Is category valid:', categories.includes(upperTerm));
        
        setSearchTerm(term);
        
        // Make search more flexible - case insensitive and handle variations
        let matchedCategory = '';
        
        // Direct match first
        if (categories.includes(upperTerm)) {
            matchedCategory = upperTerm;
        } else {
            // Try case-insensitive match
            const matched = categories.find(cat => cat.toUpperCase() === upperTerm);
            if (matched) {
                matchedCategory = matched;
            } else {
                // Try partial matches
                if (upperTerm.includes('MOTHER') || upperTerm.includes('MB')) {
                    matchedCategory = 'Motherboard';
                } else if (upperTerm.includes('STORAGE') || upperTerm.includes('SSD') || upperTerm.includes('HDD')) {
                    matchedCategory = 'Storage';
                } else if (upperTerm.includes('CASE')) {
                    matchedCategory = 'Case';
                } else if (upperTerm.includes('COOLER') || upperTerm.includes('COOLING') || upperTerm.includes('FAN')) {
                    matchedCategory = 'Cooler';
                }
            }
        }
        
        if (matchedCategory) {
            console.log('Setting filtered category to:', matchedCategory);
            setFilteredCategory(matchedCategory);
        } else {
            console.log('Clearing filtered category');
            setFilteredCategory('');
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
        setFilteredCategory('');
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
                        const categoryParts = selectedParts.filter(part => part.detectedType?.toLowerCase() === category.toLowerCase());
                        if (categoryParts.length === 0) return '';
                        return `
                            <div class="category">
                                <h2>${category}</h2>
                                ${categoryParts.map(part => `
                                    <div class="part">
                                        <div class="part-name">${part.name}</div>
                                        <div class="part-specs">${part.specs && Object.entries(part.specs).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(', ')}</div>
                                        <div class="part-specs">Brand: ${part.brand}</div>
                                        <div class="part-price">Price: TK ${part.price?.toLocaleString() || 'N/A'}</div>
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

    const downloadPDF = async () => {
        setPdfLoading(true);
        try {
            // 1. Fetch exchange rate
            const bdtRate = await fetchExchangeRate();
            const totalTK = calculateTotal();
            const totalUSD = bdtRate ? (totalTK / bdtRate).toFixed(2) : null;

            // 2. Generate PDF using jsPDF
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();

            // 3. Add content to PDF
            let yPosition = 20;

            // Header
            doc.setFontSize(24);
            doc.setTextColor(0, 123, 255); // #007bff
            doc.text('BuildMyRig', 20, yPosition);
            
            doc.setFontSize(16);
            doc.setTextColor(128, 128, 128); // gray
            doc.text('PC Build Invoice', 20, yPosition + 10);
            
            doc.setDrawColor(200, 200, 200);
            doc.line(20, yPosition + 15, 190, yPosition + 15);
            yPosition += 25;

            // Invoice details
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`Invoice #: BMR-${Date.now()}`, 20, yPosition);
            yPosition += 8;
            doc.text(`Quote Name: ${quoteName || 'Quote'}`, 20, yPosition);
            yPosition += 8;
            doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 20, yPosition);
            yPosition += 8;
            doc.text(`Total Items: ${selectedParts.length}`, 20, yPosition);
            
            doc.setDrawColor(200, 200, 200);
            doc.line(20, yPosition + 5, 190, yPosition + 5);
            yPosition += 15;

            // Parts grouped by category
            doc.setFontSize(14);
            const partsCategories = ['CPU', 'GPU', 'RAM', 'Storage', 'Motherboard', 'PSU', 'Case', 'Cooler'];
            
            partsCategories.forEach(category => {
                const categoryParts = selectedParts.filter(part => part.type?.toLowerCase() === category.toLowerCase());
                if (categoryParts.length === 0) return;

                // Category header
                doc.setFontSize(14);
                doc.setFont(undefined, 'bold');
                doc.text(category, 20, yPosition);
                yPosition += 10;

                // Parts in this category
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
                categoryParts.forEach(part => {
                    if (yPosition > 250) {
                        doc.addPage();
                        yPosition = 20;
                    }

                    // Part name (bold)
                    doc.setFont(undefined, 'bold');
                    doc.text(part.name, 25, yPosition);
                    yPosition += 6;

                    // Brand
                    doc.setFont(undefined, 'normal');
                    doc.text(`Brand: ${part.brand}`, 30, yPosition);
                    yPosition += 5;

                    // First 2 specs
                    if (part.specs && Object.keys(part.specs).length > 0) {
                        const specs = Object.entries(part.specs).slice(0, 2);
                        specs.forEach(([key, value]) => {
                            doc.text(`${key}: ${value}`, 30, yPosition);
                            yPosition += 5;
                        });
                    }

                    // Price
                    doc.setFont(undefined, 'bold');
                    const priceStr = part.price ? part.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A';
                    doc.text(`TK ${priceStr}`, 30, yPosition);
                    yPosition += 10;
                });

                yPosition += 5; // Space between categories
            });

            // Footer
            if (yPosition > 240) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setDrawColor(200, 200, 200);
            doc.line(20, yPosition, 190, yPosition);
            yPosition += 10;

            // Total
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            const totalTKStr = totalTK.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            if (totalUSD) {
                const totalText = `Total: TK ${totalTKStr} (~ USD ${totalUSD})`;
                doc.text(totalText, 20, yPosition);
            } else {
                const totalText = `Total: TK ${totalTKStr}`;
                doc.text(totalText, 20, yPosition);
            }
            yPosition += 10;

            // Footer notes
            doc.setFontSize(8);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(128, 128, 128);
            doc.text('Live exchange rate fetched from exchangerate-api.com', 20, yPosition);
            yPosition += 6;
            doc.text('Generated by BuildMyRig | For offline shopping reference only', 20, yPosition);

            // 4. Save PDF
            const date = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
            const filename = `BuildMyRig-Invoice-${quoteName || 'Quote'}-${date}.pdf`;
            doc.save(filename);

            setMessage('PDF downloaded successfully!');
        } catch (error) {
            setMessage('Failed to generate PDF. Please try again.');
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <div style={{padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh'}}>
            <div style={{backgroundColor: '#007bff', color: 'white', padding: '15px', marginBottom: '20px', borderRadius: '8px'}}>
                <h1 style={{margin: 0, fontSize: '24px'}}>PC Shopping List Generator</h1>
                <p style={{margin: '5px 0 0 0', fontSize: '14px'}}>Create organized shopping lists for offline PC component purchases</p>
                <div style={{marginTop: '10px', fontSize: '12px'}}>
                    API Status: 
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

            {/* Search Bar */}
            <div style={{backgroundColor: 'white', padding: '15px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search component type (e.g., CPU, GPU, RAM, Storage, Motherboard, PSU, Case, Cooler)"
                        style={{
                            flex: 1,
                            padding: '10px 15px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#007bff'}
                        onBlur={(e) => e.target.style.borderColor = '#ddd'}
                    />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            style={{
                                padding: '10px 15px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Clear
                        </button>
                    )}
                </div>
                {filteredCategory && (
                    <div style={{marginTop: '10px', fontSize: '12px', color: '#007bff'}}>
                        Showing <strong>{filteredCategory}</strong> components only
                    </div>
                )}
            </div>
            
            {message && (
                <div style={{backgroundColor: message.includes('success') ? '#d4edda' : '#f8d7da', padding: '10px', marginBottom: '20px', borderRadius: '5px', color: message.includes('success') ? '#155724' : '#721c24'}}>
                    {message}
                </div>
            )}

            {loading && (
                <div style={{textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa'}}>
                    <div style={{fontSize: '18px', color: '#007bff', marginBottom: '10px'}}>Loading Components...</div>
                    <div style={{color: '#666'}}>Fetching from database...</div>
                </div>
            )}

            {error && (
                <div style={{backgroundColor: '#f8d7da', color: '#721c24', padding: '20px', marginBottom: '20px', borderRadius: '8px', textAlign: 'center'}}>
                    <div style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '10px'}}>Failed to Load Components</div>
                    <div>{error}</div>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '15px',
                            padding: '10px 20px',
                            backgroundColor: '#721c24',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Retry
                    </button>
                </div>
            )}

            
            {!loading && !error && (
                <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
                    {/* Parts Selection */}
                    <div style={{flex: 2}}>
                        <h2 style={{fontSize: '20px', marginBottom: '15px', color: '#333'}}>Available Components</h2>
                        <div style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>
                            Debug: filteredCategory = "{filteredCategory}"
                        </div>
                        
                        {categories.filter(category => !filteredCategory || category === filteredCategory).map(category => {
                            const categoryParts = parts.filter(p => p.type?.toLowerCase() === category.toLowerCase());
                            const categoryCount = categoryParts.length;
                            return (
                                <div key={category} style={{marginBottom: '25px'}}>
                                    <h3 style={{fontSize: '18px', marginBottom: '10px', color: '#007bff', borderBottom: '1px solid #ddd', paddingBottom: '5px'}}>
                                        {category} ({categoryCount} items)
                                    </h3>
                                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px'}}>
                                        {parts
                                            .filter(part => part.type?.toLowerCase() === category.toLowerCase())
                                            .map(part => (
                                                <div 
                                                    key={part._id} 
                                                    onClick={() => togglePart(part)}
                                                    style={{
                                                        border: selectedParts.some(p => p._id === part._id) ? '2px solid #007bff' : '1px solid #ddd',
                                                        borderRadius: '8px',
                                                        padding: '12px',
                                                        cursor: 'pointer',
                                                        backgroundColor: selectedParts.some(p => p._id === part._id) ? '#e3f2fd' : 'white',
                                                        transition: 'all 0.2s',
                                                        boxShadow: selectedParts.some(p => p._id === part._id) ? '0 2px 8px rgba(0,123,255,0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
                                                    }}
                                                >
                                                    <div style={{fontWeight: 'bold', fontSize: '16px', marginBottom: '5px'}}>{part.name}</div>
                                                    <div style={{color: '#666', fontSize: '12px', marginBottom: '5px'}}>{part.specs && Object.entries(part.specs).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(', ')}</div>
                                                    <div style={{color: '#999', fontSize: '11px', marginBottom: '8px'}}>Brand: {part.brand}</div>
                                                    <div style={{color: '#007bff', fontSize: '18px', fontWeight: 'bold'}}>TK {part.price?.toLocaleString() || 'N/A'}</div>
                                                    {selectedParts.some(p => p._id === part._id) && (
                                                        <div style={{color: '#28a745', fontSize: '12px', fontWeight: 'bold', marginTop: '8px'}}>+ SELECTED</div>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            );
                        })}
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
                                <h3 style={{marginBottom: '10px'}}>Selected Items ({selectedParts.length})</h3>
                                {selectedParts.length === 0 ? (
                                    <p style={{color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px'}}>No items selected</p>
                                ) : (
                                    <div style={{maxHeight: '250px', overflowY: 'auto'}}>
                                        {categories.filter(category => !filteredCategory || category === filteredCategory).map(category => {
                                            const categoryParts = selectedParts.filter(part => part.type?.toLowerCase() === category.toLowerCase());
                                            if (categoryParts.length === 0) return null;
                                            return (
                                                <div key={category} style={{marginBottom: '15px'}}>
                                                    <div style={{fontWeight: 'bold', color: '#007bff', marginBottom: '5px', fontSize: '12px', textTransform: 'uppercase'}}>{category}</div>
                                                    {categoryParts.map(part => (
                                                        <div key={part._id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: '#f8f9fa', marginBottom: '3px', borderRadius: '4px'}}>
                                                            <span style={{fontSize: '13px'}}>{part.name}</span>
                                                            <span style={{color: '#28a745', fontWeight: 'bold', fontSize: '14px'}}>TK {part.price?.toLocaleString() || 'N/A'}</span>
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
                                
                                {selectedParts.length > 0 && (
                                    <button
                                        onClick={downloadPDF}
                                        disabled={pdfLoading}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            backgroundColor: pdfLoading ? '#6c757d' : '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            cursor: pdfLoading ? 'not-allowed' : 'pointer',
                                            marginBottom: '10px',
                                            opacity: pdfLoading ? 0.6 : 1
                                        }}
                                    >
                                        {pdfLoading ? 'Generating PDF...' : 'Download PDF Invoice'}
                                    </button>
                                )}
                                
                                <button
                                    onClick={() => {
                                        console.log('Button clicked!', { saveLoading, quoteName: quoteName.trim(), selectedPartsLength: selectedParts.length });
                                        saveQuote();
                                    }}
                                    disabled={saveLoading || !quoteName.trim() || selectedParts.length === 0}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: saveLoading ? '#6c757d' : '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        cursor: saveLoading ? 'not-allowed' : 'pointer',
                                        opacity: (saveLoading || !quoteName.trim() || selectedParts.length === 0) ? 0.6 : 1
                                    }}
                                >
                                    {saveLoading ? 'Saving...' : 'Save Shopping List'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
