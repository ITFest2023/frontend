import {useState} from "react";

const useRouteFinder = () => {

    const [directionsResponse, setDirectionsResponse] = useState(null)

    const [scoredParkingSpots, setScoredParkingSpots] = useState([])

    const [target, setTarget] = useState()

    const calculateBestTarget = (parkingSpots, currentLoc, targetLocation) => {

        // 1. Most free spots near to one another
        // 2. Closed to the current location (maybe following the route)
        // 3. Closest to the target
        // example parkingSpot:
        const directionsService = new google.maps.DirectionsService()

        const waypoints = parkingSpots.map((parkingSpot, index) => {
            return /** @type google.maps.DirectionsWaypoint */{
                location: { lat: parkingSpot.lat, lng: parkingSpot.lng, key: index },
                stopover: true
            };
        });

        // 2. Closest to the current location
        directionsService.route({
            origin: currentLoc,
            destination: targetLocation,
            waypoints,
            optimizeWaypoints: true,
            travelMode: google.maps.TravelMode.DRIVING
        }, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                result.routes[0].waypoint_order.forEach((waypointIndex, index) => {
                    parkingSpots[waypointIndex].score = {order: index};
                });

                parkingSpots.sort((a, b) => b.score.order - a.score.order)

                // 1. Most free spots near to one another
                let free = 0;
                for (let i = 0; i < parkingSpots.length; i++) {
                    if(parkingSpots[i].freeSpot){
                        free++;
                    } else {
                        free = 0;
                    }

                    parkingSpots[i].score.freeSpotCount = free;
                }

                // 3. Closest to the target
                for (let i = 0; i < parkingSpots.length; i++) {
                    const parkingSpot = parkingSpots[i]
                    const distance = getDistanceFromLatLonInM(parkingSpot.lat, parkingSpot.lng, targetLocation.lat, targetLocation.lng)
                    parkingSpots[i].score.distance = distance
                }

                // 3.5 Sort by the distance to the target
                parkingSpots.sort((a, b) => a.score.distance - b.score.distance)
                parkingSpots.map((parkingSpot, index) => parkingSpot.score.distance = index)

                // 4. Calculate the final score
                calculateScore(parkingSpots)

                // scoredParkingSpots.forEach(parkingSpot => console.log(parkingSpot.uuid + ": " + parkingSpot.finalScore + " - fsc " + parkingSpot.score.freeSpotCount + " - ord " + parkingSpot.score.order + " - dist " + parkingSpot.score.distance))

                setTarget(scoredParkingSpots.reduce((prev, current) => (prev.finalScore < current.finalScore) ? prev : current))
            }
        })
    }


    const calculateScore = (parkingSpots) => {
        const scoredParkingSpots = parkingSpots.map(parkingSpot => {
            const score = parkingSpot.score
            return {
                ...parkingSpot,
                finalScore: parkingSpot.freeSpot ? (score.freeSpotCount /parkingSpots.length + score.order /parkingSpots.length + score.distance /parkingSpots.length) : 10000
            }
        })
        setScoredParkingSpots(scoredParkingSpots)
    }



    const filterParkingSpotsInRange = (parkingSpots, rangeInMeters, target) => {

        return parkingSpots.filter(parkingSpot => {
            const distance = getDistanceFromLatLonInM(parkingSpot.lat, parkingSpot.lng, target.lat, target.lng)
            return distance <= rangeInMeters
        })
    }


    const getDistanceFromLatLonInM = (lat1, lon1, lat2, lon2) => {
        const earthRadiusInMeters = 6371000; // Earth radius in meters
        const degToRad = (deg) => deg * (Math.PI / 180); // Function to convert degrees to radians

        // Convert latitude and longitude from degrees to radians
        const lat1Rad = degToRad(lat1);
        const lon1Rad = degToRad(lon1);
        const lat2Rad = degToRad(lat2);
        const lon2Rad = degToRad(lon2);

        // Calculate the differences between latitudes and longitudes
        const latDiff = lat2Rad - lat1Rad;
        const lonDiff = lon2Rad - lon1Rad;

        // Haversine formula to calculate distance
        const a = Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(lonDiff / 2) * Math.sin(lonDiff / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // Distance in meters
        return earthRadiusInMeters * c;
    }

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };


    // Expose the target state to the parent component

    return {filterParkingSpotsInRange, calculateBestTarget, target}

}
export default useRouteFinder
