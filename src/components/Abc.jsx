import react,{useState} from 'react';
// access domain after @ like abc@gmail output.com -> @gamial.com

const Abc=()=>{
   const [email, setEmail] = useState("");
   const [domain, setDomain] = useState("");

   const getDomain = () => {
      

   };

    return(
        
        <>
            <input type="text" placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={getDomain}>Get Domain </button>
            {domain && <p>{domain}</p>}
        </>
    )
}

export default Abc;