<?php

class Pedido {

    private $conn;
    private $table = "pedido";

    public function __construct($db) {
        $this->conn = $db;
    }

    /* ================= LISTAR ================= */
    public function listar() {

        //$query = "SELECT * FROM {$this->table} ORDER BY id_pedido DESC";
        $query = "
SELECT 
    p.*,
    s.nome AS shaper,
    c.descricao AS composicao,
    v.descricao AS variacao,
    a.descricao AS acabamento,
    t.descricao AS tecido,
    k.descricao AS configuracaoquilha,
    q.descricao AS sistemaquilha,

    GROUP_CONCAT(co.descricao SEPARATOR ', ') AS cores,
    GROUP_CONCAT(co.id_cor) AS cores_ids

FROM {$this->table} p

INNER JOIN shaper s ON p.id_shaper = s.id_shaper
INNER JOIN composicao c ON p.id_composicao = c.id_composicao
INNER JOIN variacao v ON p.id_variacao = v.id_variacao
INNER JOIN acabamento a ON p.id_acabamento = a.id_acabamento
INNER JOIN tecido t ON p.id_tecido = t.id_tecido
INNER JOIN configuracaoquilha k ON p.id_configuracaoquilha = k.id_configuracaoquilha
INNER JOIN sistemaquilha q ON p.id_sistemaquilha = q.id_sistemaquilha

LEFT JOIN pedido_cor pc ON p.id_pedido = pc.id_pedido
LEFT JOIN cor co ON pc.id_cor = co.id_cor

GROUP BY p.id_pedido
ORDER BY p.id_pedido DESC
        ";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /* ================= BUSCAR POR ID ================= */
    public function buscar($id) {

    $query = "
SELECT 
    p.*,
    s.nome AS shaper,
    c.descricao AS composicao,
    v.descricao AS variacao,
    a.descricao AS acabamento,
    t.descricao AS tecido,
    k.descricao AS configuracaoquilha,
    q.descricao AS sistemaquilha,

    GROUP_CONCAT(co.descricao SEPARATOR ', ') AS cores,
    GROUP_CONCAT(co.id_cor) AS cores_ids

FROM {$this->table} p

INNER JOIN shaper s ON p.id_shaper = s.id_shaper
INNER JOIN composicao c ON p.id_composicao = c.id_composicao
INNER JOIN variacao v ON p.id_variacao = v.id_variacao
INNER JOIN acabamento a ON p.id_acabamento = a.id_acabamento
INNER JOIN tecido t ON p.id_tecido = t.id_tecido
INNER JOIN configuracaoquilha k ON p.id_configuracaoquilha = k.id_configuracaoquilha
INNER JOIN sistemaquilha q ON p.id_sistemaquilha = q.id_sistemaquilha

LEFT JOIN pedido_cor pc ON p.id_pedido = pc.id_pedido
LEFT JOIN cor co ON pc.id_cor = co.id_cor

WHERE p.id_pedido = :id

GROUP BY p.id_pedido
LIMIT 1
    ";

    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(":id", $id, PDO::PARAM_INT);
    $stmt->execute();

    return $stmt->fetch(PDO::FETCH_ASSOC);
}

    /* ================= CRIAR ================= */
    public function criar(
        $data,
        $id_shaper,
        $id_composicao,
        $id_variacao,
        $id_acabamento,
        $id_tecido,
        $id_configuracaoquilha,
        $id_sistemaquilha,
        $observacao,
        $cores
    ) {

        $query = "INSERT INTO {$this->table}
            (data, id_shaper, id_composicao, id_variacao, id_acabamento,
            id_tecido, id_configuracaoquilha, id_sistemaquilha, observacao)
            VALUES
            (:data, :id_shaper, :id_composicao, :id_variacao, :id_acabamento,
            :id_tecido, :id_configuracaoquilha, :id_sistemaquilha, :observacao)";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":data", $data);
        $stmt->bindParam(":id_shaper", $id_shaper);
        $stmt->bindParam(":id_composicao", $id_composicao);
        $stmt->bindParam(":id_variacao", $id_variacao);
        $stmt->bindParam(":id_acabamento", $id_acabamento);
        $stmt->bindParam(":id_tecido", $id_tecido);
        $stmt->bindParam(":id_configuracaoquilha", $id_configuracaoquilha);
        $stmt->bindParam(":id_sistemaquilha", $id_sistemaquilha);
        $stmt->bindParam(":observacao", $observacao);

        if ($stmt->execute()) {

            $id_pedido = $this->conn->lastInsertId();

            if (!empty($cores)) {

                $queryCor = "INSERT INTO pedido_cor (id_pedido, id_cor)
                            VALUES (:id_pedido, :id_cor)";

                $stmtCor = $this->conn->prepare($queryCor);

                foreach ($cores as $cor) {

                    $stmtCor->bindParam(":id_pedido", $id_pedido);
                    $stmtCor->bindParam(":id_cor", $cor);
                    $stmtCor->execute();
                }
            }

            return true;
        }

        return false;
    }

    /* ================= ATUALIZAR ================= */
public function atualizar(
    $id,
    $data,
    $id_shaper,
    $id_composicao,
    $id_variacao,
    $id_acabamento,
    $id_tecido,
    $id_configuracaoquilha,
    $id_sistemaquilha,
    $observacao,
    $cores
) {

    $query = "UPDATE {$this->table} SET
        data = :data,
        id_shaper = :id_shaper,
        id_composicao = :id_composicao,
        id_variacao = :id_variacao,
        id_acabamento = :id_acabamento,
        id_tecido = :id_tecido,
        id_configuracaoquilha = :id_configuracaoquilha,
        id_sistemaquilha = :id_sistemaquilha,
        observacao = :observacao
        WHERE id_pedido = :id";

    $stmt = $this->conn->prepare($query);

    $stmt->bindParam(":id", $id);
    $stmt->bindParam(":data", $data);
    $stmt->bindParam(":id_shaper", $id_shaper);
    $stmt->bindParam(":id_composicao", $id_composicao);
    $stmt->bindParam(":id_variacao", $id_variacao);
    $stmt->bindParam(":id_acabamento", $id_acabamento);
    $stmt->bindParam(":id_tecido", $id_tecido);
    $stmt->bindParam(":id_configuracaoquilha", $id_configuracaoquilha);
    $stmt->bindParam(":id_sistemaquilha", $id_sistemaquilha);
    $stmt->bindParam(":observacao", $observacao);

    $stmt->execute();

    /* ===== REMOVE CORES ANTIGAS ===== */

    $delete = "DELETE FROM pedido_cor WHERE id_pedido = :id_pedido";
    $stmtDelete = $this->conn->prepare($delete);
    $stmtDelete->bindParam(":id_pedido", $id);
    $stmtDelete->execute();

    /* ===== INSERE CORES NOVAS ===== */

    if (!empty($cores)) {

        $queryCor = "INSERT INTO pedido_cor (id_pedido, id_cor)
                     VALUES (:id_pedido, :id_cor)";

        $stmtCor = $this->conn->prepare($queryCor);

        foreach ($cores as $cor) {

            $stmtCor->bindParam(":id_pedido", $id);
            $stmtCor->bindParam(":id_cor", $cor);
            $stmtCor->execute();
        }
    }

    return true;
}

    /* ================= DELETAR ================= */
    public function deletar($id) {
        $query = "DELETE FROM {$this->table} WHERE id_pedido = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }
}