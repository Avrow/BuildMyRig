// Test script to create and retrieve quote
import Quote from './src/models/quote.js';

const testQuote = async () => {
    try {
        // Create a quote with a known ID
        const newQuote = await Quote.create({
            _id: 'test123456789012345678901234', // 24 chars
            userId: 'test-user',
            quoteName: 'Test Quote',
            parts: [
                {
                    partName: 'Test CPU',
                    category: 'CPU',
                    price: 10000
                }
            ]
        });
        
        console.log('Created quote:', newQuote);
        console.log('Use this ID to get the quote:', newQuote._id);
        
        // Test getting the quote
        const foundQuote = await Quote.findOne({ _id: newQuote._id });
        console.log('Found quote:', foundQuote);
        
    } catch (error) {
        console.error('Error:', error);
    }
};

testQuote();
