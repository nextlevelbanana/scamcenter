export const updateInfoText = (msg, append) => {
    const infobox = get("infobox")[0]
    const txt = infobox.get("infoText")[0]
    txt.text = append ? txt.text + msg : msg
}
