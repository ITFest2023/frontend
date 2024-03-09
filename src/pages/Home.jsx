import {GoogleMap, MarkerF, useJsApiLoader} from "@react-google-maps/api";
import useSVGPin from "../hooks/useSVGPin.jsx";
import {useState} from "react";


const loc = {lat: 48.8584, lng: 2.2945}

export default function Home({}) {
    const {isLoaded} = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY
    })

    const {pinForColor} = useSVGPin()
    const [map, setMap] = useState(/** @type google.maps.Map  */(null))

    if (!isLoaded) {
        return (
            <div>
                Loading...
            </div>
        )
    }

    return (
        <>
            <div className="flex relative flex-col items-center h-[100dvh] w-[100dvw]">
                <div className="absolute left-0 top-0 h-full w-full">
                    <GoogleMap center={loc} zoom={15} mapContainerStyle={{height: "100dvh", width: "100dvw", position: "absolute", left: 0, top: 0, zIndex: -11}} options={{
                        zoomControl: false,
                        streetViewControl: false,
                        fullscreenControl: false,
                        mapTypeControl: false
                    }}
                               onLoad={(lMap) => setMap(lMap)}>
                        {/*<MarkerF position={loc} options={{icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/parking_lot_maps.png"}} />*/}
                        <MarkerF position={loc} icon={{url: pinForColor("red"), scaledSize: new google.maps.Size(30, 30)}}/>
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