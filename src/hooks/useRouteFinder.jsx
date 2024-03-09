import {useQuery} from "@tanstack/react-query";
import {useEffect, useState} from "react";

const useRouteFinder = () => {

    const parkingSpotsQuery = useQuery({
        queryKey: ["parkingSpots"],
        queryFn: async () => {
            const response = await fetch(import.meta.env.VITE_API_URL + "/api/parking-spots/")
            const data = await response.json()
        }
    })

    const findBestTarget = (parkingSpots, currentLoc, targetLocation) => {

        // 1. Most free spots near to one another
        // 2. Closed to the current location (maybe following the route)
        // 3. Closest to the target
        // example parkingSpot:
        const directionsService = new google.maps.DirectionsService()

        const [directionsResponse, setDirectionsResponse] = useState(null)
        
        directionsService.route({
            origin: currentLoc,
            destination: targetLocation,
            waypoints: parkingSpots,
            optimizeWaypoints: true,
            travelMode: google.maps.TravelMode.DRIVING
        }, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                setDirectionsResponse(result)
                console.log(result)
            }
        })

        useEffect(() => {
            if (directionsResponse) {
                const bestParkingSpots = directionsResponse.routes[0]
                console.log(bestParkingSpots)
            }
        }, [directionsResponse]);



    }


    const filterParkingSpotsInRange = (parkingSpots, rangeInMeters, target) => {

        return parkingSpots.filter(parkingSpot => {
            const distance = getDistanceFromLatLonInM(parkingSpot.lat, parkingSpot.lng, target.lat, target.lng)
            return distance <= rangeInMeters
        })
    }


    const getDistanceFromLatLonInM = (lat1, lon1, lat2, lon2) => {

        const R = 6371; // Radius of the Earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 1000;
    }

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    return {filterParkingSpotsInRange, findBestTarget}

}
export default useRouteFinder
