import React, { useEffect , useState} from 'react';
import GenericTable from '../../components/common/genericTable';
import Loader from '../../components/common/loader';

const ContactUs: React.FC = () => {
    const [loading, setloading] = useState(true);

    useEffect(()=>{
        const timer = setTimeout(()=> setloading(false),200);
        return ()=> clearTimeout(timer);
    }, []);

    if (loading) return <Loader/>
    const columns =[
        {field: 'name', headerName: 'Name'},
        {field: 'email', headerName: 'Email'},
        {field: 'message', headerName: 'Message'},
        {field: 'module', headerName: 'Module'},
    ];

    const data = [
        {name:'SHRISTY', email:'s@example.com', message:'Need help with my account.', module:'Crypto'},
        {name:'Riya', email:'r@example.com', message:'Issue with payment.', module:'invoice'},
    ]

    return(
        <div style={{padding: '2rem'}}>
            <h2>Contact Requests</h2>
            <GenericTable columns={columns} data={data}/>
        </div>
    )
};
export default ContactUs;