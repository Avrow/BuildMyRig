import mongoose from 'mongoose';
import Component from '../src/models/Component.js';

// Component type detection based on name patterns and specs
function detectComponentType(name, specs) {
    const nameLower = name.toLowerCase();
    
    // CPU patterns
    if (nameLower.includes('intel') && (nameLower.includes('core') || nameLower.includes('i3') || nameLower.includes('i5') || nameLower.includes('i7') || nameLower.includes('i9'))) {
        return 'CPU';
    }
    if (nameLower.includes('amd') && (nameLower.includes('ryzen') || nameLower.includes('threadripper'))) {
        return 'CPU';
    }
    if (specs && (specs.core_count || specs.core_clock || specs.boost_clock)) {
        return 'CPU';
    }
    
    // GPU patterns
    if (nameLower.includes('rtx') || nameLower.includes('gtx') || nameLower.includes('radeon') || nameLower.includes('geforce')) {
        return 'GPU';
    }
    if (specs && (specs.chipset && (specs.chipset.includes('RTX') || specs.chipset.includes('GTX') || specs.chipset.includes('Radeon')))) {
        return 'GPU';
    }
    if (specs && specs.memory && specs.core_clock) {
        return 'GPU';
    }
    
    // RAM patterns
    if (nameLower.includes('ddr') || nameLower.includes('memory') || nameLower.includes('ram')) {
        return 'RAM';
    }
    if (specs && (specs.memory_type || specs.speed || specs.modules)) {
        return 'RAM';
    }
    
    // Motherboard patterns
    if (nameLower.includes('motherboard') || nameLower.includes('mb-') || nameLower.includes('rog') || nameLower.includes('msi') && nameLower.includes('motherboard')) {
        return 'Motherboard';
    }
    if (specs && (specs.socket || specs.chipset && specs.chipset.includes('Z') || specs.form_factor)) {
        return 'Motherboard';
    }
    
    // PSU patterns
    if (nameLower.includes('power supply') || nameLower.includes('psu') || nameLower.includes('corsair') && nameLower.includes('ax') || nameLower.includes('evga')) {
        return 'PSU';
    }
    if (specs && (specs.wattage || specs.efficiency || specs.modular)) {
        return 'PSU';
    }
    
    // Case patterns
    if (nameLower.includes('case') || nameLower.includes('tower') || nameLower.includes('mid tower') || nameLower.includes('full tower')) {
        return 'Case';
    }
    if (specs && (specs.type === 'Case' || specs.form_factor === 'ATX' || specs.dimensions)) {
        return 'Case';
    }
    
    // Cooler patterns
    if (nameLower.includes('cooler') || nameLower.includes('heatsink') || nameLower.includes('liquid') || nameLower.includes('aio')) {
        return 'Cooler';
    }
    if (specs && (specs.radiator_size || specs.fan_size || specs.tdp)) {
        return 'Cooler';
    }
    
    // Storage patterns
    if (nameLower.includes('ssd') || nameLower.includes('hdd') || nameLower.includes('hard drive') || nameLower.includes('solid state')) {
        return 'Storage';
    }
    if (specs && (specs.capacity || specs.interface && (specs.interface.includes('SATA') || specs.interface.includes('NVMe')))) {
        return 'Storage';
    }
    
    // Default fallback
    return 'Storage'; // Many components were incorrectly set to this
}

async function fixComponentTypes() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pc-builds');
        console.log('Connected to database');
        
        // Find all components with type 'Storage' that might be incorrectly categorized
        const suspiciousComponents = await Component.find({ type: 'Storage' });
        console.log(`Found ${suspiciousComponents.length} components with type 'Storage'`);
        
        let fixedCount = 0;
        const typeDistribution = {};
        
        for (const component of suspiciousComponents) {
            const correctType = detectComponentType(component.name, component.specs);
            
            if (correctType !== 'Storage') {
                console.log(`Fixing: "${component.name}" from "${component.type}" to "${correctType}"`);
                await Component.findByIdAndUpdate(component._id, { type: correctType });
                fixedCount++;
                
                typeDistribution[correctType] = (typeDistribution[correctType] || 0) + 1;
            }
        }
        
        console.log(`\nFixed ${fixedCount} component types`);
        console.log('Type distribution:', typeDistribution);
        
        // Show updated counts by type
        const finalCounts = await Component.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        console.log('\nFinal component counts by type:');
        finalCounts.forEach(({ _id, count }) => {
            console.log(`${_id}: ${count}`);
        });
        
    } catch (error) {
        console.error('Error fixing component types:', error);
    } finally {
        await mongoose.disconnect();
    }
}

fixComponentTypes();
