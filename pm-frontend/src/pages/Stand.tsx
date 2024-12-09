import { Typography } from "@mui/material";
import Saldi from "../components/Saldi";

export default function Stand() {
  return (
    <>
    <Typography variant='h4'>Hoe staan we ervoor?</Typography>
    <Saldi title={'Opening'} datum={'opening'}/>
    <br/><br/><br/>
    <Saldi title={'Stand per'}datum={new Date().toISOString().slice(0, 10)}/>
    </>
  )
}