import nc from "next-connect";
import bcrypt from "bcryptjs";
import axios from "axios";
import config from "../../../utils/config";
import { signToken } from "../../../utils/auth";
import client from "../../../utils/client";

const handler = nc();

handler.post(async (req, res) => {
  const projectId = config.projectId;
  const dataset = config.dataset;
  const tokenWithWriteAccess = process.env.SANITY_AUTH_TOKEN;
  const createMutations = [
    {
      create: {
        _type: "user",
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password),
        tipoDocumento: req.body.tipoDocumento,
        documento: req.body.documento,
        celular: req.body.celular,
        fecha: req.body.fecha,
        genero: req.body.genero,
        rol: "User",
      },
    },
  ];

  console.log(createMutations);
  const existUser = await client.fetch(
    `*[_type == "user" && email == $email][0]`,
    {
      email: req.body.email,
    }
  );

  if (existUser) {
    return res.status(401).send({ message: "Este email ya esta registrado" });
  }
  try {
    const { data } = await axios.post(
      `https://${projectId}.api.sanity.io/v1/data/mutate/${dataset}?returnIds=true`,
      { mutations: createMutations },
      {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${tokenWithWriteAccess}`,
        },
      }
    );
    console.log(data);
  } catch (error) {
    console.log(error);
  }
  const userId = data.results[0].id;
  const user = {
    _id: userId,
    name: req.body.name,
    email: req.body.email,
    isAdmin: false,
  };
  const token = signToken(user);
  console.log(token);
  res.send({ ...user, token });
});

export default handler;
