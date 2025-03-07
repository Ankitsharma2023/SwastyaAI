<script>
	import Chart from 'chart.js/auto';
	import { onMount } from 'svelte';
    export let q;
	let heartRateArray = [];
	let bloodPressureHArray = [];
	let bloodPressureLArray = [];
	let timeStamps = [];
	

	async function fetchVitals(q) {
		
			const response = await fetch(
                `/patients/api/vitals?name=${encodeURIComponent(q.name)}&id=${q.id||1}`
			);
			if (response.ok) {
				const data = await response.json();
				const heartRate = data.heartRate;
				const bloodPressure = data.bloodPressure;
				heartRateArray.push(heartRate);
				const [H, L] = bloodPressure.split('/');
				bloodPressureHArray.push(parseInt(H));
				bloodPressureLArray.push(parseInt(L));
				timeStamps.push(new Date().toLocaleTimeString());
			}
		
	}

	onMount(() => {
        const heartRateCtx = document.getElementById('heartRateChart');
        const bloodPressureCtx = document.getElementById('bloodPressureChart');
        const heartRateChart = new Chart(heartRateCtx, {
            type: 'line',
            data: {
                labels: timeStamps,
                datasets: [
                    {
                        label: 'Heart Rate',
                        data: heartRateArray,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: false,
                        max: 120,
                        min: 60
                    }
                }
            }
        });
        const bloodPressureChart = new Chart(bloodPressureCtx, {
            type: 'line',
            data: {
                labels: timeStamps,
                datasets: [
                    {
                        label: 'Blood Pressure(Systolic)',
                        data: bloodPressureHArray,
                        backgroundColor: 'rgba(132, 255, 99, 0.2)',
                        borderColor: 'rgba(132, 255, 99, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Blood Pressure(Diastolic)',
                        data: bloodPressureLArray,
                        backgroundColor: 'rgba(99, 132, 255, 0.2)',
                        borderColor: 'rgba(99, 132, 255, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: false,
                        max: 180,
                        min: 0
                    }
                }
            }
        });
        const interval = setInterval(() => {
            fetchVitals(q).then(() => {
                if (heartRateArray.length > 10) {
                    heartRateArray.shift();
                }
                if (bloodPressureHArray.length > 10) {
                    bloodPressureHArray.shift();
                }
                if (bloodPressureLArray.length > 10) {
                    bloodPressureLArray.shift();
                }
                if (timeStamps.length > 10) {
                    timeStamps.shift();
                }

                heartRateChart.data.datasets[0].data = heartRateArray;
                heartRateChart.data.labels = timeStamps;
                heartRateChart.update();

                bloodPressureChart.data.datasets[0].data = bloodPressureHArray;
                bloodPressureChart.data.datasets[1].data = bloodPressureLArray;
                bloodPressureChart.data.labels = timeStamps;
                bloodPressureChart.update();
            });
        }, 1000);
        return () => clearInterval(interval);
    });
</script>

<main class="w-full">
    <h1 class="text-2xl text-center font-semibold">Graph View</h1>
    <button on:click={()=>{q=null}}><svg
        width="25"
        height="25"
        viewBox="0 0 25 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle
            cx="12.7617"
            cy="12.4375"
            r="11.5811"
            transform="rotate(-89.944 12.7617 12.4375)"
            fill="#004E86"
            stroke="white"
            stroke-width="0.837838"
        />
        <path
            d="M18.9911 12.831C19.4538 12.8315 19.8293 12.4567 19.8298 11.994C19.8302 11.5313 19.4555 11.1558 18.9928 11.1553L18.9911 12.831ZM6.00767 11.388C5.68016 11.7149 5.67964 12.2454 6.00652 12.5729L11.3333 17.9101C11.6601 18.2376 12.1906 18.2381 12.5182 17.9112C12.8457 17.5844 12.8462 17.0539 12.5193 16.7264L7.78442 11.9822L12.5286 7.24732C12.8561 6.92044 12.8566 6.38996 12.5297 6.06244C12.2029 5.73492 11.6724 5.73441 11.3448 6.06128L6.00767 11.388ZM18.9928 11.1553L6.60035 11.1432L6.59872 12.8189L18.9911 12.831L18.9928 11.1553Z"
            fill="white"
        />
    </svg></button>
    <div class="text-xl"><span class="font-[600]">Patient's Name: </span>{q.name}</div>
    <div class="text-xl"><span class="font-[600]">Room no.: </span>{q.room}</div>
    <div class="w-full flex  flex-col md:flex-row ">
	<div class="w-full md:w-1/2 h-1/2">
		<canvas id="heartRateChart"></canvas>
	</div>

	<div class="w-full md:w-1/2 h-1/2">
		<canvas id="bloodPressureChart"></canvas>
	</div>
    </div>
</main>
