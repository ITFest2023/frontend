import {GoogleMap, MarkerF, useJsApiLoader} from "@react-google-maps/api";
import useSVGPin from "../hooks/useSVGPin.jsx";
import {useState} from "react";
import {useGeolocation} from "@uidotdev/usehooks";
import {useQuery} from "@tanstack/react-query";


export default function Home({}) {
    const {isLoaded} = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY
    })

    const {pinForColor, pinForStatus, pinForFreeSpot} = useSVGPin()
    const [map, setMap] = useState(/** @type google.maps.Map  */(null))

    const parkingSpotsQuery = useQuery({
        queryKey: ["parkingSpots"],
        queryFn: async () => {
            // const response = await fetch(import.meta.env.VITE_API_URL + "/api/parking-spots/")
            // const data = await response.json()

            const center = {lat: 45.7652305, lng: 21.2298339}

            // Get Random location with lat and lng, based on center with a maximum of m meters distance from the center
            const getRandomLocation = (center, m) => {
                const x0 = center.lat;
                const y0 = center.lng
                const rd = m / 111300 //about 111300 meters in one degree

                const u = Math.random();
                const v = Math.random();

                const w = rd * Math.sqrt(u);
                const t = 2 * Math.PI * v;

                return {lat: w * Math.cos(t) + x0, lng: w * Math.sin(t) + y0}
            }

            const data = [
                {
                    "uuid": "0751928e-312e-4e76-80e7-924078d92fb2",
                    "freeSpot": false,
                    "battery": 23.0,
                    "lat": 0.0,
                    "lng": 0.0,
                    "lastTimeReq": null,
                    "status": "ONLINE"
                },
                {
                    "uuid": "0751928e-312e-4e76-80e7-924078d92fb2",
                    "freeSpot": true,
                    "battery": 16.0,
                    "lat": 0.0,
                    "lng": 0.0,
                    "lastTimeReq": null,
                    "status": "UNREGISTERED"
                },
                {
                    "uuid": "0751928e-312e-4e76-80e7-924078d92fb2",
                    "freeSpot": true,
                    "battery": 16.0,
                    "lat": 0.0,
                    "lng": 0.0,
                    "lastTimeReq": null,
                    "status": "REGISTERED"
                },
                {
                    "uuid": "0751928e-312e-4e76-80e7-924078d92fb2",
                    "freeSpot": true,
                    "battery": 16.0,
                    "lat": 0.0,
                    "lng": 0.0,
                    "lastTimeReq": null,
                    "status": "OFFLINE"
                }
            ]

            for (let location of data) {
                let loct = getRandomLocation(center, 50)
                location.lat = loct.lat
                location.lng = loct.lng
            }

            return data
        }
    })

    const userLocation = useGeolocation()

    if (!isLoaded) {
        return (
            <div>
                Loading...
            </div>
        )
    }

    if (userLocation.loading) {
        return (
            <div>
                Loading Location...
            </div>
        )
    }

    return (
        <>
            <div className="flex relative flex-col items-center h-[100dvh] w-[100dvw]">
                <div className="absolute left-0 top-0 h-full w-full">
                    <GoogleMap
                        center={{lat: userLocation.latitude, lng: userLocation.longitude}}
                        zoom={18}
                        mapContainerStyle={{height: "100dvh", width: "100dvw", position: "absolute", left: 0, top: 0, zIndex: -11}}
                        options={{
                            zoomControl: false,
                            streetViewControl: false,
                            fullscreenControl: false,
                            mapTypeControl: false
                        }}
                        onLoad={(lMap) => setMap(lMap)}>
                        {parkingSpotsQuery.isSuccess && parkingSpotsQuery.data.map((spot, index) => {
                            return (
                                <MarkerF key={index} position={{lat: spot.lat, lng: spot.lng}} options={{
                                    icon: {
                                        url: pinForFreeSpot(spot.freeSpot, spot.status, spot.battery),
                                        scaledSize: new window.google.maps.Size(20, 20)
                                    }
                                }}/>
                            )
                        })}
                    </GoogleMap>
                </div>
                <div className={"p-4 rounded m-4 bg-gray-700 z-10 "}>
                    <div className={"text-2xl text-white"}>

                    </div>
                </div>
            </div>
        </>
    )
}