export const updateInfoText = (msg, append) => {
    const txt = get("infobox")[0].get("infoText")[0]
    txt.text = append ? txt.text + msg : msg
}