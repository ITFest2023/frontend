
const COLORS = {
    "REGISTERED": "blue",
    "ONLINE": "green",
    "OFFLINE": "#FF7F7F"
}

const useSVGPin = () => {

    const svgPin = (color, strokeColor) => {

        let svgMarker = `
        <svg fill="${color}" stroke-width="35" stroke="${strokeColor}" xmlns="http://www.w3.org/2000/svg" viewBox="0 -35 384 600">
            <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
        </svg>`

        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgMarker)}`
    }

    const pin = (freeSpot, status) => {
        if (status === "OFFLINE") return svgPin(COLORS[status], COLORS[status])
        if (status === "REGISTERED") return svgPin(COLORS[status], COLORS[status])
        return svgPin(freeSpot ? "green" : "red", freeSpot ? "green" : "red")
    }

    return {pin}
}
export default useSVGPin
