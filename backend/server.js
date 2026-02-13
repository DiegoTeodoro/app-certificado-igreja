const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());          // libera acesso do Angular
app.use(express.json());

const path = require("path");
const fs = require("fs");
const multer = require("multer");// lê JSON do body


// Pool de conexões (melhor que createConnection)
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "dbcertificados",
  waitForConnections: true,
  connectionLimit: 10,
});

// garante pasta uploads
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// config do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// POST /api/cursos -> cria curso
app.post("/api/cursos", async (req, res) => {
  console.log("POST /api/cursos body =", req.body);
  try {
    const { nomeCurso, dataCadastro, cargaHoraria, validadeCertificado, descricao } = req.body;

    // validações básicas
    if (!nomeCurso || !dataCadastro || !cargaHoraria || !validadeCertificado) {
      return res.status(400).json({ message: "Campos obrigatórios faltando." });
    }
    if (Number(cargaHoraria) <= 0 || Number(validadeCertificado) <= 0) {
      return res.status(400).json({ message: "cargaHoraria e validadeCertificado devem ser > 0." });
    }

    const sql = `
      INSERT INTO curso (nome_curso, data_cadastro, carga_horaria, validade_meses, descricao)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      nomeCurso,
      dataCadastro, // "YYYY-MM-DD"
      Number(cargaHoraria),
      Number(validadeCertificado),
      descricao ?? null,
    ];

    const [result] = await pool.execute(sql, params);

    return res.status(201).json({
      id: result.insertId,
      message: "Curso cadastrado com sucesso!",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro interno ao salvar curso." });
  }
});


// GET /api/cursos?q=abc -> lista cursos (filtra por nome)
app.get("/api/cursos", async (req, res) => {
  try {
    const q = (req.query.q ?? "").toString().trim();

    let sql = "SELECT id, nome_curso FROM curso";
    let params = [];

    if (q.length > 0) {
      sql += " WHERE nome_curso LIKE ? ";
      params.push(`%${q}%`);
    }

    sql += " ORDER BY nome_curso ASC LIMIT 20";

    const [rows] = await pool.execute(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao listar cursos." });
  }
});


// POST /api/participantes -> cria participante
app.post("/api/participantes", async (req, res) => {
  console.log("POST /api/participantes body =", req.body);

  try {
    const {
      nomeCompleto,
      cpf,
      email,
      igreja,
      dataCadastro,
      status,
      telefone1,
      telefone2,
      observacoes,
    } = req.body;

    // ✅ Só os obrigatórios
    if (!nomeCompleto || !igreja || !dataCadastro || !status) {
      return res.status(400).json({ message: "Campos obrigatórios não preenchidos." });
    }

    if (!["ATIVO", "INATIVO"].includes(status)) {
      return res.status(400).json({ message: "Status inválido. Use ATIVO ou INATIVO." });
    }

    // ✅ CPF opcional (se vier, valida e impede duplicado)
    let cpfNormalizado = null;
    if (cpf && String(cpf).trim() !== "") {
      cpfNormalizado = String(cpf).replace(/\D/g, "");
      if (cpfNormalizado.length !== 11) {
        return res.status(400).json({ message: "CPF inválido." });
      }

      const [cpfExistente] = await pool.execute(
        "SELECT codigo FROM participante WHERE cpf = ?",
        [cpfNormalizado]
      );

      if (cpfExistente.length > 0) {
        return res.status(409).json({ message: "Já existe um participante cadastrado com este CPF." });
      }
    }

    const sql = `
      INSERT INTO participante (
        nome_completo, cpf, email, igreja, data_cadastro,
        status, telefone1, telefone2, observacoes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      nomeCompleto.trim(),
      cpfNormalizado, // null se não veio
      email?.trim() || null,
      igreja.trim(),
      dataCadastro, // "YYYY-MM-DD"
      status,
      telefone1?.trim() || null,
      telefone2?.trim() || null,
      observacoes?.trim() || null,
    ];

    const [result] = await pool.execute(sql, params);

    return res.status(201).json({
      codigo: result.insertId,
      message: "Participante cadastrado com sucesso!",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro interno ao salvar participante." });
  }
});

// GET /api/participantes?q=abc -> lista participantes filtrando por nome
app.get("/api/participantes", async (req, res) => {
  try {
    const q = (req.query.q ?? "").toString().trim();

    let sql = `
      SELECT
        codigo,
        nome_completo AS nomeCompleto,
        cpf
      FROM participante
    `;
    const params = [];

    if (q.length > 0) {
      sql += " WHERE nome_completo LIKE ? ";
      params.push(`%${q}%`);
    }

    sql += " ORDER BY nome_completo ASC LIMIT 20";

    const [rows] = await pool.execute(sql, params);

    // ✅ opcional: se cpf vier do banco só com números, você pode devolver assim mesmo
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao listar participantes." });
  }
});

// GET /api/participantes/buscar?nome=paulo
app.get("/api/participantes/buscar", async (req, res) => {
  try {
    const nome = (req.query.nome ?? "").toString().trim();
    if (nome.length < 2) return res.status(400).json({ message: "Informe pelo menos 2 letras." });

    const sql = `
      SELECT codigo, nome_completo AS nomeCompleto
      FROM participante
      WHERE nome_completo LIKE ?
      ORDER BY nome_completo ASC
      LIMIT 1
    `;

    const [rows] = await pool.execute(sql, [`%${nome}%`]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Participante não encontrado." });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("ERRO BUSCAR PARTICIPANTE:", err);
    return res.status(500).json({ message: "Erro ao buscar participante." });
  }
});

// GET /api/relatorios/participantes?nome=abc
app.get("/api/relatorios/participantes", async (req, res) => {
  try {
    const nome = (req.query.nome ?? "").toString().trim();
console.log("✅ ENTROU NA ROTA RELATORIO PARTICIPANTES", req.query);
    let sql = `
      SELECT
        codigo,
        nome_completo AS nomeCompleto,
        cpf,
        email,
        igreja,
        data_cadastro AS dataCadastro,
        status,
        telefone1,
        telefone2,
        observacoes
      FROM participante
    `;

    const params = [];

    if (nome.length > 0) {
      sql += " WHERE nome_completo LIKE ? ";
      params.push(`%${nome}%`);
    }

    sql += " ORDER BY nome_completo ASC"; // ✅ sem LIMIT

    const [rows] = await pool.execute(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao listar relatório de participantes." });
  }
});




// POST /api/lancamentos -> cria lançamento
app.post("/api/lancamentos", async (req, res) => {
  console.log("POST /api/lancamentos body =", req.body);

  try {
    const {
      curso_id,
      participante_codigo,
      instrutor,
      data_realizacao,
      data_vencimento,
      descricao
    } = req.body;

    // ✅ Validações básicas
    if (!curso_id || !participante_codigo || !instrutor || !data_realizacao || !data_vencimento) {
      return res.status(400).json({
        message: "Campos obrigatórios não preenchidos."
      });
    }

    // ✅ Verifica se curso existe
    const [cursoExiste] = await pool.execute(
      "SELECT id FROM curso WHERE id = ?",
      [curso_id]
    );

    if (cursoExiste.length === 0) {
      return res.status(404).json({
        message: "Curso não encontrado."
      });
    }

    // ✅ Verifica se participante existe
    const [participanteExiste] = await pool.execute(
      "SELECT codigo FROM participante WHERE codigo = ?",
      [participante_codigo]
    );

    if (participanteExiste.length === 0) {
      return res.status(404).json({
        message: "Participante não encontrado."
      });
    }

    // ✅ Insere lançamento
    const sql = `
      INSERT INTO lancamento (
        curso_id,
        participante_codigo,
        instrutor,
        data_realizacao,
        data_vencimento,
        descricao
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      Number(curso_id),
      Number(participante_codigo),
      instrutor.trim(),
      data_realizacao,   // formato: "YYYY-MM-DD"
      data_vencimento,   // formato: "YYYY-MM-DD"
      descricao?.trim() || null
    ];

    const [result] = await pool.execute(sql, params);

    return res.status(201).json({
      codigo: result.insertId,
      message: "Lançamento salvo com sucesso!"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Erro interno ao salvar lançamento."
    });
  }
});

// POST /api/lancamentos/:codigo/anexos
app.post("/api/lancamentos/:codigo/anexos", upload.single("file"), async (req, res) => {
  try {
    const lancamentoCodigo = Number(req.params.codigo);

    if (!req.file) {
      return res.status(400).json({ message: "Nenhum arquivo enviado." });
    }

    // valida se lançamento existe
    const [lancExiste] = await pool.execute(
      "SELECT codigo FROM lancamento WHERE codigo = ?",
      [lancamentoCodigo]
    );
    if (lancExiste.length === 0) {
      return res.status(404).json({ message: "Lançamento não encontrado." });
    }

    const nomeOriginal = req.file.originalname;
    const nomeArquivo = req.file.filename;
    const mimeType = req.file.mimetype;
    const tamanhoBytes = req.file.size;
    const caminho = `uploads/${nomeArquivo}`; // relativo

    const sql = `
    INSERT INTO lancamento_anexo (
      lancamento_codigo,
      nome_original,
      nome_arquivo,
      mime_type,
      tamanho_bytes,
      caminho
    ) VALUES (?, ?, ?, ?, ?, ?)
    `;


    const params = [
      lancamentoCodigo,
      nomeOriginal,
      nomeArquivo,
      mimeType,
      tamanhoBytes,
      caminho
    ];

    const [result] = await pool.execute(sql, params);

    return res.status(201).json({
      id: result.insertId,
      message: "Anexo salvo com sucesso!"
    });

  } catch (err) {
  console.error("ERRO UPLOAD ANEXO:", err);
  return res.status(500).json({
    message: "Erro interno ao salvar anexo.",
    detail: err?.message ?? String(err)
  });
}

});

// GET /api/certificados?participante_codigo=123
app.get("/api/certificados", async (req, res) => {
  try {
    const participanteCodigo = Number(req.query.participante_codigo);

    if (!participanteCodigo) {
      return res.status(400).json({ message: "participante_codigo é obrigatório." });
    }

    const sql = `
      SELECT
        curso,
        descricao,
        instrutor,
        data_realizacao,
        data_vencimento,
        status
      FROM vw_certificados
      WHERE participante_codigo = ?
      ORDER BY data_vencimento DESC
    `;

    const [rows] = await pool.execute(sql, [participanteCodigo]);
    return res.json(rows);
  } catch (err) {
    console.error("ERRO CERTIFICADOS:", err);
    return res.status(500).json({ message: "Erro ao listar certificados." });
  }
});



app.listen(3000, () => console.log("API rodando em http://localhost:3000"));
