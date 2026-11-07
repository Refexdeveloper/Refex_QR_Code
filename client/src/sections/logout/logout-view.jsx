import axios from "axios";
import { useState, useEffect } from "react";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import { useRouter } from "src/routes/hooks";

import { useAuth } from "src/context/AuthContext";

export default function LogoutView() {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const {logout} = useAuth();

  useEffect(() => {
    axios
      .post(`/auth/logout`)
      .then((response) => {
        // console.log(response);
        if (response.data.status) {
          setTimeout(()=>{
            logout();
            router.push('/login');
            setOpen(false);
          },1000);
        }
      }).catch((error)=>{
        router.push("/employees");
        setOpen(false);
        console.log(error.message);
      });
  });

  return (
    <div>
      <Backdrop
        sx={{ color: "blue", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}
