'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';

export default function QuoteGenerator() {
    const { user } = useAuth();
    const [parts, setParts] = useState([]);
    const [selectedParts, setSelectedParts] = useState([]);
    const [quoteName, setQuoteName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [savedQuotes, setSavedQuotes] = useState([]);

    const categories = ['CPU', 'GPU', 'RAM', 'SSD', 'Motherboard'];

    useEffect(() => {
        fetchParts();
        if (user) {
            fetchUserQuotes();
        }
    }, [user]);

    const fetchParts = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/parts');
            const data = await response.json();
            if (data.success) {
                setParts(data.data);
            }
        } catch (err) {
            setError('Failed to fetch parts');
        }
    };

    const fetchUserQuotes = async () => {
        if (!user) return;
        try {
            const response = await fetch(`http://localhost:8000/api/quotes/user/${user.id}`);
            const data = await response.json();
            if (data.success) {
                setSavedQuotes(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch quotes:', err);
        }
    };

    const togglePart = (part) => {
        const isSelected = selectedParts.some(p => p.id === part.id);
        if (isSelected) {
            setSelectedParts(selectedParts.filter(p => p.id !== part.id));
        } else {
            setSelectedParts([...selectedParts, part]);
        }
    };

    const calculateTotal = () => {
        return selectedParts.reduce((total, part) => total + part.price, 0);
    };

    const saveQuote = async () => {
        if (!quoteName.trim()) {
            setError('Please enter a quote name');
            return;
        }
        if (selectedParts.length === 0) {
            setError('Please select at least one part');
            return;
        }
        if (!user) {
            setError('Please login to save quotes');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('http://localhost:8000/api/quotes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    quoteName,
                    parts: selectedParts.map(part => ({
                        partName: part.name,
                        category: part.category,
                        price: part.price
                    }))
                })
            });

            const data = await response.json();
            if (data.success) {
                setSuccess('Quote saved successfully!');
                setQuoteName('');
                setSelectedParts([]);
                fetchUserQuotes();
            } else {
                setError(data.message || 'Failed to save quote');
            }
        } catch (err) {
            setError('Failed to save quote');
        } finally {
            setLoading(false);
        }
    };

    const deleteQuote = async (quoteId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/quotes/${quoteId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();
            if (data.success) {
                setSavedQuotes(savedQuotes.filter(q => q._id !== quoteId));
                setSuccess('Quote deleted successfully!');
            } else {
                setError(data.message || 'Failed to delete quote');
            }
        } catch (err) {
            setError('Failed to delete quote');
        }
    };

    const getPartsByCategory = (category) => {
        return parts.filter(part => part.category === category);
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>PC Build Quote Generator</h1>
            
            {error && <div style={styles.error}>{error}</div>}
            {success && <div style={styles.success}>{success}</div>}

            <div style={styles.content}>
                {/* Parts Selection */}
                <div style={styles.partsSection}>
                    <h2 style={styles.sectionTitle}>Select Parts</h2>
                    {categories.map(category => (
                        <div key={category} style={styles.categorySection}>
                            <h3 style={styles.categoryTitle}>{category}</h3>
                            <div style={styles.partsGrid}>
                                {getPartsByCategory(category).map(part => (
                                    <div
                                        key={part.id}
                                        style={{
                                            ...styles.partCard,
                                            ...(selectedParts.some(p => p.id === part.id) ? styles.selectedPart : {})
                                        }}
                                        onClick={() => togglePart(part)}
                                    >
                                        <div style={styles.partName}>{part.name}</div>
                                        <div style={styles.partPrice}>৳{part.price.toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quote Summary */}
                <div style={styles.summarySection}>
                    <h2 style={styles.sectionTitle}>Quote Summary</h2>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Quote Name:</label>
                        <input
                            type="text"
                            value={quoteName}
                            onChange={(e) => setQuoteName(e.target.value)}
                            placeholder="Enter quote name..."
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.selectedPartsList}>
                        <h3 style={styles.subTitle}>Selected Parts ({selectedParts.length})</h3>
                        {selectedParts.length === 0 ? (
                            <p style={styles.emptyMessage}>No parts selected</p>
                        ) : (
                            selectedParts.map(part => (
                                <div key={part.id} style={styles.selectedPart}>
                                    <span>{part.name} - {part.category}</span>
                                    <span>৳{part.price.toLocaleString()}</span>
                                </div>
                            ))
                        )}
                    </div>

                    <div style={styles.totalSection}>
                        <div style={styles.total}>Total: ৳{calculateTotal().toLocaleString()}</div>
                        <button
                            onClick={saveQuote}
                            disabled={loading || !user}
                            style={{
                                ...styles.saveButton,
                                ...(loading || !user ? styles.disabledButton : {})
                            }}
                        >
                            {loading ? 'Saving...' : 'Save Quote'}
                        </button>
                        {!user && <p style={styles.loginMessage}>Please login to save quotes</p>}
                    </div>
                </div>
            </div>

            {/* Saved Quotes */}
            {user && savedQuotes.length > 0 && (
                <div style={styles.savedQuotesSection}>
                    <h2 style={styles.sectionTitle}>Your Saved Quotes</h2>
                    <div style={styles.quotesGrid}>
                        {savedQuotes.map(quote => (
                            <div key={quote._id} style={styles.quoteCard}>
                                <div style={styles.quoteHeader}>
                                    <h3 style={styles.quoteName}>{quote.quoteName}</h3>
                                    <button
                                        onClick={() => deleteQuote(quote._id)}
                                        style={styles.deleteButton}
                                    >
                                        Delete
                                    </button>
                                </div>
                                <div style={styles.quoteDate}>
                                    {new Date(quote.createdAt).toLocaleDateString()}
                                </div>
                                <div style={styles.quoteParts}>
                                    {quote.parts.length} parts
                                </div>
                                <div style={styles.quoteTotal}>
                                    Total: ৳{quote.totalPrice.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
    },
    title: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '30px',
        fontSize: '2.5em'
    },
    error: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '12px',
        borderRadius: '4px',
        marginBottom: '20px',
        border: '1px solid #f5c6cb'
    },
    success: {
        backgroundColor: '#d4edda',
        color: '#155724',
        padding: '12px',
        borderRadius: '4px',
        marginBottom: '20px',
        border: '1px solid #c3e6cb'
    },
    content: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '30px',
        marginBottom: '40px'
    },
    partsSection: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px'
    },
    summarySection: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        height: 'fit-content'
    },
    sectionTitle: {
        color: '#333',
        marginBottom: '20px',
        fontSize: '1.5em'
    },
    categorySection: {
        marginBottom: '30px'
    },
    categoryTitle: {
        color: '#555',
        marginBottom: '15px',
        fontSize: '1.2em'
    },
    partsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '15px'
    },
    partCard: {
        backgroundColor: 'white',
        border: '2px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    selectedPart: {
        borderColor: '#007bff',
        backgroundColor: '#e7f3ff',
        transform: 'scale(1.02)'
    },
    partName: {
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#333'
    },
    partPrice: {
        color: '#007bff',
        fontSize: '1.1em',
        fontWeight: 'bold'
    },
    inputGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#333'
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px'
    },
    selectedPartsList: {
        marginBottom: '20px',
        maxHeight: '200px',
        overflowY: 'auto'
    },
    subTitle: {
        color: '#333',
        marginBottom: '10px',
        fontSize: '1.1em'
    },
    emptyMessage: {
        color: '#666',
        fontStyle: 'italic'
    },
    selectedPart: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px',
        backgroundColor: 'white',
        marginBottom: '5px',
        borderRadius: '4px',
        border: '1px solid #ddd'
    },
    totalSection: {
        borderTop: '2px solid #ddd',
        paddingTop: '20px'
    },
    total: {
        fontSize: '1.5em',
        fontWeight: 'bold',
        color: '#007bff',
        marginBottom: '15px',
        textAlign: 'center'
    },
    saveButton: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease'
    },
    disabledButton: {
        backgroundColor: '#6c757d',
        cursor: 'not-allowed'
    },
    loginMessage: {
        textAlign: 'center',
        color: '#666',
        marginTop: '10px',
        fontSize: '0.9em'
    },
    savedQuotesSection: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px'
    },
    quotesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
    },
    quoteCard: {
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    quoteHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
    },
    quoteName: {
        margin: 0,
        color: '#333'
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px'
    },
    quoteDate: {
        color: '#666',
        fontSize: '0.9em',
        marginBottom: '8px'
    },
    quoteParts: {
        color: '#555',
        marginBottom: '8px'
    },
    quoteTotal: {
        fontWeight: 'bold',
        color: '#007bff',
        fontSize: '1.1em'
    }
};
