import {GoogleMap, Marker, useJsApiLoader} from "@react-google-maps/api";
import {useParams} from "react-router-dom";
import axios from "axios";
import {useGeolocation} from "@uidotdev/usehooks";


export default function Admin() {

    // Use param uuid from url
    const {uuid} = useParams()

    const userLocation = useGeolocation()

    if (userLocation.loading) {
        return <div>Fetching location...</div>
    }

    return (
        <>
            <div className={"text-huge text-green-700"}>
                {
                    axios.patch(import.meta.env.BASE_URL + "register?uuid=" + uuid, {lat: userLocation.latitude, lng: userLocation.longitude})
                        .then(response => {
                            console.log(response.data)
                            return response.data
                        })
                        .catch(error => {
                            console.log(error)
                            return error
                        })
                }
            </div>
        </>
    )
}
