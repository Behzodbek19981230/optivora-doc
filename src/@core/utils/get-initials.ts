// ** Returns initials from string
export const getInitials = (string: string) =>{
    
    if(string.split(/\s/).length > 2){
        return string.split(/\s/)[0].slice(0,1).toUpperCase() + string.split(/\s/)[1].slice(0,1).toUpperCase()
    }
    else return string.split(/\s/).reduce((response, word) => response += word.slice(0, 1).toUpperCase(), '')

}
