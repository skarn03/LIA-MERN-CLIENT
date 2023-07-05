import { useEffect,useState } from "react";
const useFetch = (url) => {
    let [issearching, setSearching] = useState(true);
  const [data, setData] = useState(null);
  const [error,setError]= useState(null);
    useEffect(() => {
        const abortCont = new AbortController();
        fetch(url,{signal:abortCont.signal}).then(Res => {
            console.log(Res)
            if (!Res.ok) {
                throw Error('Data not found/accessible');
            }
            return Res.json();
        }).then((data) => {
            setData(data);
            setSearching(false);
        }).catch((e) => {
            if(e.name === 'AbortError'){
                console.log('fetch aborted');
            }else{
            setSearching(false)
            setError(e.message);
            }
        
        })
        return  ()=>abortCont.abort();
    }, [url]);

    return{
        data,issearching,error
    }
}
export default useFetch;