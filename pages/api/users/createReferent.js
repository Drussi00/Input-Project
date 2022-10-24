import axios from "axios";
import nc from "next-connect";
import config from "../../../utils/config";
import {  isAuth } from "../../../utils/auth";
import client from "../../../utils/client";

const handler = nc();


handler.use(isAuth);
handler.put(async (req, res) => {
  console.log(req.body)
  const tokenWithWriteAccess = process.env.SANITY_AUTH_TOKEN;
  try {
      await axios.post(
        `https://${config.projectId}.api.sanity.io/v1/data/mutate/${config.dataset}`,
        {
          mutations: [
            {
              patch: {
                id: req.body._id,
                set: {
                  rol: req.body.rol,
                  email: req.body.email,
                  password: req.body.password
                },
              },
            },
          ],
        },
        {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${tokenWithWriteAccess}`,
          },
        }
      );
      
  const user = {
    _id: req.body._id,
    rol: req.body.rol,
    email: req.body.email,
    password: req.body.password,
  };
  res.send(user);
  } catch (error) {
    console.log(error)
    res.send({error});
  }

});

handler.post(async (req, res) => {
  const tokenWithWriteAccess = process.env.SANITY_AUTH_TOKEN;
  try {
    
      const { data } = await axios.post(
        `https://${config.projectId}.api.sanity.io/v1/data/mutate/${config.dataset}?returnIds=true`,
        {
          mutations: [
            {
              create: {
                  _type: "user",
                  referente:{
                    _type: "reference",
                    _ref: req.user._id,
                  },
                  rol: req.body.rol,
                  email: req.body.email,
                  password: req.body.password
              },
            },
          ],
        },
        {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${tokenWithWriteAccess}`,
          },
        }
      );
      console.log(data,data.results[0].id)
      const user = {
        _id: data.results[0].id,
        rol: req.body.rol,
        email: req.body.email,
        password: req.body.password,
      };

      res.send(user);
  } catch (error) {
    console.log(error)
    
  res.send({
    error
  });
  }
 
});

handler.get(async (req, res) => {
  try {
    const users = await client.fetch(`*[_type == "user" && referente._ref == $idReferente]`, {
      idReferente: req.user._id,
    });
    
    res.send(users);
  } catch (error) {
    console.log(error)
    res.send({error});
  }

});

export default handler;
