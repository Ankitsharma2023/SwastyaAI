export async function GET({ url }) {
    const name = url.searchParams.get('name');
    const id = url.searchParams.get('id');
    const patients = {
        "1": { name: "Jenna Smith", baseVitals: { heartRate: 72, systolic: 120, diastolic: 80 } },
        "2": { name: "Michael Johnson", baseVitals: { heartRate: 78, systolic: 110, diastolic: 70 } },
    };
    const rand_id=Math.floor(Math.random() * 2) + 1; 
    const patient = patients[rand_id.toString()];

    if (!patient) {
        return new Response(JSON.stringify({ error: "Patient not found" }), { status: 404 });
    }

    
    const variation = (base, range) => Math.floor(base + (Math.random() * range - range / 2));
    const heartRate = variation(patient.baseVitals.heartRate, 5); 
    const systolic = variation(patient.baseVitals.systolic, 10); 
    const diastolic = variation(patient.baseVitals.diastolic, 5);

    
    const vitals = {
        heartRate,
        bloodPressure: `${systolic}/${diastolic}`,
    };

    
    return new Response(JSON.stringify(vitals), {
        headers: { 'Content-Type': 'application/json' },
    });
}
